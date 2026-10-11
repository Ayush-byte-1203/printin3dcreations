import { API_BASE } from '../data/catalog';
import { adminFetch } from '../adminApi';

export const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'p8hyihu9';
export const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || 'printin3d_unsigned';

/**
 * Uploads an image file with dual reliability:
 * 1. Primary: Direct upload to Cloudinary (bypasses server disk & prevents hosting 404/storage errors on live site)
 * 2. Fallback: Backend Django /api/upload/ endpoint
 *
 * @param {File} file - File object to upload
 * @returns {Promise<string>} The secure HTTPS Cloudinary image URL
 */
export async function uploadImage(file) {
    if (!file) throw new Error('No file provided for upload.');

    // 1. Try Direct Cloudinary Upload (Recommended for live site to bypass PythonAnywhere limits)
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            }
        } else {
            const errData = await response.json().catch(() => ({}));
            console.warn('Direct Cloudinary upload returned non-OK status:', errData);
        }
    } catch (directErr) {
        console.warn('Direct Cloudinary upload failed, falling back to backend upload:', directErr);
    }

    // 2. Fallback to Backend /api/upload/ endpoint
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    const backendResponse = await adminFetch(`${API_BASE}/upload/`, {
        method: 'POST',
        body: backendFormData
    });

    const data = await backendResponse.json();
    if (backendResponse.ok && (data.success || data.url)) {
        return data.url;
    }

    throw new Error(data.error || data.detail || 'Image upload failed. Please verify server connectivity.');
}
