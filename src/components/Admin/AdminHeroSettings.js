import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { adminFetch } from '../../adminApi';
import { uploadImage } from '../../utils/cloudinary';
import { API_BASE } from '../../data/catalog';
import {
    Sliders,
    Sparkles,
    Image as ImageIcon,
    Video,
    Palette,
    Plus,
    Trash2,
    Save,
    CheckCircle,
    Eye,
    Truck,
    Zap,
    Tag,
    Flame,
    Gift,
    Heart,
    Star,
    Upload,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';
import '../CSS/Admin.css';

const ICON_OPTIONS = [
    { label: 'Truck (Shipping)', value: 'truck', icon: <Truck size={14} /> },
    { label: 'Zap (Deals/Offers)', value: 'zap', icon: <Zap size={14} /> },
    { label: 'Sparkles (New)', value: 'sparkles', icon: <Sparkles size={14} /> },
    { label: 'Tag (Custom/Promo)', value: 'tag', icon: <Tag size={14} /> },
    { label: 'Flame (Hot/Trending)', value: 'flame', icon: <Flame size={14} /> },
    { label: 'Gift (Present/Discounts)', value: 'gift', icon: <Gift size={14} /> },
    { label: 'Heart (Loved/Crafted)', value: 'heart', icon: <Heart size={14} /> },
    { label: 'Star (Featured)', value: 'star', icon: <Star size={14} /> }
];

const THEME_PRESETS = [
    {
        name: 'Midnight Slate (Default)',
        desc: 'Deep dark slate marquee with electric blue glow and clean glass header',
        headerTheme: 'dark',
        headerBgColor: 'rgba(255, 255, 255, 0.98)',
        headerTextColor: '#0F172A',
        marqueeBgColor: 'linear-gradient(90deg, #090E1A 0%, #0F172A 50%, #090E1A 100%)',
        marqueeTextColor: '#F1F5F9',
        marqueeAccentColor: '#60A5FA',
        marqueeBorderColor: 'rgba(59, 130, 246, 0.22)'
    },
    {
        name: 'Cyber Neon',
        desc: 'Futuristic black with electric cyan and bright blue highlights',
        headerTheme: 'dark',
        headerBgColor: 'rgba(10, 15, 30, 0.98)',
        headerTextColor: '#38BDF8',
        marqueeBgColor: 'linear-gradient(90deg, #030712 0%, #0B192C 50%, #030712 100%)',
        marqueeTextColor: '#E0F2FE',
        marqueeAccentColor: '#38BDF8',
        marqueeBorderColor: 'rgba(56, 189, 248, 0.4)'
    },
    {
        name: 'Imperial Gold',
        desc: 'Warm luxury charcoal with rich gold and amber accents',
        headerTheme: 'dark',
        headerBgColor: 'rgba(24, 24, 27, 0.98)',
        headerTextColor: '#FBBF24',
        marqueeBgColor: 'linear-gradient(90deg, #18181B 0%, #27272A 50%, #18181B 100%)',
        marqueeTextColor: '#FEF3C7',
        marqueeAccentColor: '#F59E0B',
        marqueeBorderColor: 'rgba(245, 158, 11, 0.35)'
    },
    {
        name: 'Monochrome Clean',
        desc: 'High contrast crisp white and deep obsidian black',
        headerTheme: 'light',
        headerBgColor: '#FFFFFF',
        headerTextColor: '#000000',
        marqueeBgColor: '#000000',
        marqueeTextColor: '#FFFFFF',
        marqueeAccentColor: '#93C5FD',
        marqueeBorderColor: 'rgba(255, 255, 255, 0.15)'
    }
];

const AdminHeroSettings = () => {
    const { siteSettings, refreshData } = useData();

    const [activeTab, setActiveTab] = useState('marquee'); // 'marquee' | 'hero' | 'theme'
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Marquee State
    const [marqueeEnabled, setMarqueeEnabled] = useState(true);
    const [marqueeSpeed, setMarqueeSpeed] = useState(75);
    const [marqueeItems, setMarqueeItems] = useState([]);

    // Hero Media State
    const [heroMediaType, setHeroMediaType] = useState('video');
    const [heroImage, setHeroImage] = useState('');
    const [heroImages, setHeroImages] = useState([]);
    const [heroCarouselEnabled, setHeroCarouselEnabled] = useState(false);
    const [heroCarouselSpeed, setHeroCarouselSpeed] = useState(5);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [heroVideos, setHeroVideos] = useState([]);
    const [heroTitle, setHeroTitle] = useState('Precision 3D Creations');
    const [heroSubtitle, setHeroSubtitle] = useState('');

    // Theme & Color State
    const [headerTheme, setHeaderTheme] = useState('dark');
    const [headerBgColor, setHeaderBgColor] = useState('rgba(255, 255, 255, 0.98)');
    const [headerTextColor, setHeaderTextColor] = useState('#0F172A');
    const [marqueeBgColor, setMarqueeBgColor] = useState('linear-gradient(90deg, #090E1A 0%, #0F172A 50%, #090E1A 100%)');
    const [marqueeTextColor, setMarqueeTextColor] = useState('#F1F5F9');
    const [marqueeAccentColor, setMarqueeAccentColor] = useState('#60A5FA');
    const [marqueeBorderColor, setMarqueeBorderColor] = useState('rgba(59, 130, 246, 0.22)');

    // New item form state for marquee
    const [newItemBadge, setNewItemBadge] = useState('');
    const [newItemBadgeType, setNewItemBadgeType] = useState('cyan');
    const [newItemMain, setNewItemMain] = useState('');
    const [newItemHighlight, setNewItemHighlight] = useState('');
    const [newItemIcon, setNewItemIcon] = useState('sparkles');
    const [newItemTarget, setNewItemTarget] = useState('#products');
    const [newVideoUrl, setNewVideoUrl] = useState('');

    useEffect(() => {
        if (siteSettings) {
            setMarqueeEnabled(siteSettings.marquee_enabled !== false);
            setMarqueeSpeed(siteSettings.marquee_speed || 75);
            setMarqueeItems(siteSettings.marquee_items || []);
            setHeroMediaType(siteSettings.hero_media_type || 'video');
            setHeroImage(siteSettings.hero_image || '');
            const imgs = Array.isArray(siteSettings.hero_images) && siteSettings.hero_images.length > 0
                ? siteSettings.hero_images
                : (siteSettings.hero_image ? [siteSettings.hero_image] : []);
            setHeroImages(imgs);
            setHeroCarouselEnabled(!!siteSettings.hero_carousel_enabled);
            setHeroCarouselSpeed(siteSettings.hero_carousel_speed || 5);
            setHeroVideos(siteSettings.hero_videos || [
                '/videos/hero-background1.mp4',
                '/videos/hero-background2.mp4',
                '/videos/hero-background3.mp4'
            ]);
            setHeroTitle(siteSettings.hero_title || 'Precision 3D Creations');
            setHeroSubtitle(siteSettings.hero_subtitle || 'Crafted for Creators, Collectors & Modern Spaces');
            setHeaderTheme(siteSettings.header_theme || 'dark');
            setHeaderBgColor(siteSettings.header_bg_color || 'rgba(255, 255, 255, 0.98)');
            setHeaderTextColor(siteSettings.header_text_color || '#0F172A');
            setMarqueeBgColor(siteSettings.marquee_bg_color || 'linear-gradient(90deg, #090E1A 0%, #0F172A 50%, #090E1A 100%)');
            setMarqueeTextColor(siteSettings.marquee_text_color || '#F1F5F9');
            setMarqueeAccentColor(siteSettings.marquee_accent_color || '#60A5FA');
            setMarqueeBorderColor(siteSettings.marquee_border_color || 'rgba(59, 130, 246, 0.22)');
        }
    }, [siteSettings]);

    const handleApplyPreset = (preset) => {
        setHeaderTheme(preset.headerTheme);
        setHeaderBgColor(preset.headerBgColor);
        setHeaderTextColor(preset.headerTextColor);
        setMarqueeBgColor(preset.marqueeBgColor);
        setMarqueeTextColor(preset.marqueeTextColor);
        setMarqueeAccentColor(preset.marqueeAccentColor);
        setMarqueeBorderColor(preset.marqueeBorderColor);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setErrorMsg('');
        try {
            const uploadedUrl = await uploadImage(file);
            setHeroImages(prev => [...prev, uploadedUrl]);
            if (!heroImage) setHeroImage(uploadedUrl);
            setHeroMediaType('image');
            setSuccessMsg('Hero image uploaded and added to carousel gallery!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            console.error('Hero upload error', err);
            setErrorMsg(err.message || 'Image upload failed.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) return;
        const url = newImageUrl.trim();
        setHeroImages(prev => [...prev, url]);
        if (!heroImage) setHeroImage(url);
        setNewImageUrl('');
        setHeroMediaType('image');
    };

    const handleRemoveHeroImage = (index) => {
        const updated = [...heroImages];
        const removed = updated.splice(index, 1)[0];
        setHeroImages(updated);
        if (heroImage === removed) {
            setHeroImage(updated[0] || '');
        }
    };

    const handleSetPrimaryCover = (index) => {
        const target = heroImages[index];
        if (!target) return;
        setHeroImage(target);
        // Move selected image to first position
        const updated = [target, ...heroImages.filter((_, i) => i !== index)];
        setHeroImages(updated);
    };

    const handleMoveHeroImage = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= heroImages.length) return;
        const updated = [...heroImages];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setHeroImages(updated);
    };

    const handleAddMarqueeItem = (e) => {
        e.preventDefault();
        if (!newItemMain.trim() && !newItemHighlight.trim()) {
            setErrorMsg('Please provide announcement text.');
            return;
        }

        const newItem = {
            id: 'item-' + Date.now(),
            icon: newItemIcon,
            badge: newItemBadge.trim(),
            badge_type: newItemBadgeType,
            main_text: newItemMain.trim(),
            highlight_text: newItemHighlight.trim(),
            target: newItemTarget.trim() || '#products'
        };

        setMarqueeItems([...marqueeItems, newItem]);
        setNewItemBadge('');
        setNewItemMain('');
        setNewItemHighlight('');
        setErrorMsg('');
    };

    const handleRemoveMarqueeItem = (index) => {
        const copy = [...marqueeItems];
        copy.splice(index, 1);
        setMarqueeItems(copy);
    };

    const handleAddVideo = () => {
        if (!newVideoUrl.trim()) return;
        setHeroVideos([...heroVideos, newVideoUrl.trim()]);
        setNewVideoUrl('');
    };

    const handleRemoveVideo = (index) => {
        const copy = [...heroVideos];
        copy.splice(index, 1);
        setHeroVideos(copy);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        const payload = {
            marquee_enabled: marqueeEnabled,
            marquee_speed: Number(marqueeSpeed),
            marquee_items: marqueeItems,
            hero_media_type: heroMediaType,
            hero_image: heroImage || (heroImages[0] || ''),
            hero_images: heroImages,
            hero_carousel_enabled: heroCarouselEnabled,
            hero_carousel_speed: Number(heroCarouselSpeed),
            hero_videos: heroVideos,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            header_theme: headerTheme,
            header_bg_color: headerBgColor,
            header_text_color: headerTextColor,
            marquee_bg_color: marqueeBgColor,
            marquee_text_color: marqueeTextColor,
            marquee_accent_color: marqueeAccentColor,
            marquee_border_color: marqueeBorderColor
        };

        try {
            const res = await adminFetch(`${API_BASE}/settings/1/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccessMsg('All hero media, marquee settings & theme colors saved successfully!');
                await refreshData();
                setTimeout(() => setSuccessMsg(''), 5000);
            } else {
                const data = await res.json().catch(() => ({}));
                setErrorMsg(data.error || data.detail || JSON.stringify(data) || 'Failed to save settings.');
            }
        } catch (err) {
            console.error('Save settings error', err);
            setErrorMsg(err.message || 'Network error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-content-inner">
            {/* Page Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 6px' }}>
                        Hero Media & Announcement Studio
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: 0, fontSize: '0.92rem' }}>
                        Manage homepage hero media, customize the live ticker announcements, and calibrate header color themes.
                    </p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleSaveAll}
                    disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.95rem', fontWeight: 700 }}
                >
                    <Save size={18} />
                    {saving ? 'Saving Changes...' : 'Save Settings'}
                </button>
            </div>

            {/* Status alerts */}
            {successMsg && (
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                    <CheckCircle size={20} color="#10B981" />
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                    <AlertCircle size={20} color="#EF4444" />
                    {errorMsg}
                </div>
            )}

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--admin-border)', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('marquee')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'marquee' ? '3px solid #3B82F6' : '3px solid transparent',
                        color: activeTab === 'marquee' ? '#3B82F6' : 'var(--admin-text-muted)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Sparkles size={18} />
                    Announcement Marquee
                </button>
                <button
                    onClick={() => setActiveTab('hero')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'hero' ? '3px solid #3B82F6' : '3px solid transparent',
                        color: activeTab === 'hero' ? '#3B82F6' : 'var(--admin-text-muted)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <ImageIcon size={18} />
                    Hero Media (Video/Image)
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'theme' ? '3px solid #3B82F6' : '3px solid transparent',
                        color: activeTab === 'theme' ? '#3B82F6' : 'var(--admin-text-muted)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Palette size={18} />
                    Header & Marquee Colors
                </button>
            </div>

            {/* TAB 1: MARQUEE SETTINGS */}
            {activeTab === 'marquee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* Activation & Speed Card */}
                    <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--admin-border)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sliders size={20} color="#3B82F6" />
                            Marquee Ticker Controls
                        </h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: marqueeEnabled ? '#EFF6FF' : '#F8FAFC', borderRadius: '10px', border: marqueeEnabled ? '1px solid #BFDBFE' : '1px solid var(--admin-border)', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: marqueeEnabled ? '#1E40AF' : '#64748B' }}>
                                    Marquee Bar Status: {marqueeEnabled ? 'Active (Displaying on Site)' : 'Disabled (Hidden on Site)'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                                    Toggle this to show or completely remove the marquee bar below the header.
                                </div>
                            </div>
                            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={marqueeEnabled}
                                    onChange={(e) => setMarqueeEnabled(e.target.checked)}
                                    style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: 700, color: marqueeEnabled ? '#2563EB' : '#64748B' }}>
                                    {marqueeEnabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                            </label>
                        </div>

                        <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                                Scrolling Speed (Duration: {marqueeSpeed} seconds)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <input
                                    type="range"
                                    min="35"
                                    max="120"
                                    step="5"
                                    value={marqueeSpeed}
                                    onChange={(e) => setMarqueeSpeed(Number(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ fontWeight: 700, minWidth: '80px', color: '#2563EB' }}>
                                    {marqueeSpeed}s / loop
                                </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                                Recommended: 70s - 90s for comfortable reading. Lower values scroll faster.
                            </span>
                        </div>
                    </div>

                    {/* Messages Manager Card */}
                    <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--admin-border)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={20} color="#3B82F6" />
                            Live Promotional Messages ({marqueeItems.length})
                        </h2>

                        {/* List of current messages */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {marqueeItems.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 18px',
                                        background: '#F8FAFC',
                                        border: '1px solid var(--admin-border)',
                                        borderRadius: '8px',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                                        <span style={{ color: '#2563EB' }}>
                                            {ICON_OPTIONS.find(o => o.value === item.icon)?.icon || <Sparkles size={14} />}
                                        </span>
                                        {item.badge && (
                                            <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                background: item.badge_type === 'gold' ? '#FEF3C7' : item.badge_type === 'cyan' ? '#E0F2FE' : '#EFF6FF',
                                                color: item.badge_type === 'gold' ? '#B45309' : item.badge_type === 'cyan' ? '#0284C7' : '#1D4ED8'
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                        <span style={{ fontWeight: 500, color: '#1E293B' }}>{item.main_text}</span>
                                        <span style={{ fontWeight: 700, color: '#2563EB' }}>{item.highlight_text}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>({item.target})</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMarqueeItem(idx)}
                                        style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Message Form */}
                        <div style={{ background: '#F1F5F9', padding: '18px', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px' }}>Add New Announcement Message</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Main Text</label>
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        placeholder="e.g. Free Shipping on Orders"
                                        value={newItemMain}
                                        onChange={(e) => setNewItemMain(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Highlight Text (Bold / Colored)</label>
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        placeholder="e.g. Above ₹500"
                                        value={newItemHighlight}
                                        onChange={(e) => setNewItemHighlight(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Badge Text (Optional)</label>
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        placeholder="e.g. Limited Offer"
                                        value={newItemBadge}
                                        onChange={(e) => setNewItemBadge(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Badge Style</label>
                                    <select
                                        className="admin-form-control"
                                        value={newItemBadgeType}
                                        onChange={(e) => setNewItemBadgeType(e.target.value)}
                                    >
                                        <option value="cyan">Cyan Pill</option>
                                        <option value="gold">Gold Pill</option>
                                        <option value="blue">Blue Pill</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Icon</label>
                                    <select
                                        className="admin-form-control"
                                        value={newItemIcon}
                                        onChange={(e) => setNewItemIcon(e.target.value)}
                                    >
                                        {ICON_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Click Target Link</label>
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        placeholder="#products or /contact"
                                        value={newItemTarget}
                                        onChange={(e) => setNewItemTarget(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={handleAddMarqueeItem}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Plus size={16} /> Add Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: HERO MEDIA SETTINGS */}
            {activeTab === 'hero' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--admin-border)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Video size={20} color="#3B82F6" />
                            Hero Media Mode
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div
                                onClick={() => setHeroMediaType('video')}
                                style={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    border: heroMediaType === 'video' ? '2px solid #3B82F6' : '1px solid var(--admin-border)',
                                    background: heroMediaType === 'video' ? '#EFF6FF' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem', color: heroMediaType === 'video' ? '#1D4ED8' : '#1E293B' }}>
                                    <Video size={20} />
                                    Dynamic Video Background
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '6px' }}>
                                    Plays rotating background videos in an endless cinematic loop.
                                </div>
                            </div>

                            <div
                                onClick={() => setHeroMediaType('image')}
                                style={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    border: heroMediaType === 'image' ? '2px solid #3B82F6' : '1px solid var(--admin-border)',
                                    background: heroMediaType === 'image' ? '#EFF6FF' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem', color: heroMediaType === 'image' ? '#1D4ED8' : '#1E293B' }}>
                                    <ImageIcon size={20} />
                                    Custom Hero Image Banner
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '6px' }}>
                                    Displays a high-resolution custom hero image uploaded directly from your computer.
                                </div>
                            </div>
                        </div>

                        {/* Image & Carousel Section (Active if image mode selected) */}
                        {heroMediaType === 'image' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                                {/* Carousel Mode & Speed Control Card */}
                                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ImageIcon size={18} color="#2563EB" />
                                                Hero Carousel / Slideshow Mode
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                                                Automatically rotate multiple background images in a smooth cinematic slideshow.
                                            </div>
                                        </div>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={heroCarouselEnabled}
                                                onChange={(e) => setHeroCarouselEnabled(e.target.checked)}
                                                style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 700, color: heroCarouselEnabled ? '#2563EB' : '#64748B' }}>
                                                {heroCarouselEnabled ? 'CAROUSEL ACTIVE' : 'SINGLE IMAGE ONLY'}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Speed Controller when Carousel is Enabled */}
                                    {heroCarouselEnabled && (
                                        <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '12px' }}>
                                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>
                                                Slideshow Transition Speed (Interval: {heroCarouselSpeed} seconds per slide)
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="15"
                                                    step="1"
                                                    value={heroCarouselSpeed}
                                                    onChange={(e) => setHeroCarouselSpeed(Number(e.target.value))}
                                                    style={{ flex: 1 }}
                                                />
                                                <span style={{ fontWeight: 800, minWidth: '70px', color: '#2563EB', fontSize: '1rem' }}>
                                                    {heroCarouselSpeed}s / slide
                                                </span>
                                            </div>
                                            
                                            {/* Quick Speed Presets */}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.78rem', color: '#64748B', marginRight: '4px' }}>Quick Presets:</span>
                                                {[
                                                    { label: '3s (Fast)', val: 3 },
                                                    { label: '5s (Balanced)', val: 5 },
                                                    { label: '8s (Relaxed)', val: 8 },
                                                    { label: '10s (Cinematic)', val: 10 }
                                                ].map(preset => (
                                                    <button
                                                        key={preset.val}
                                                        type="button"
                                                        onClick={() => setHeroCarouselSpeed(preset.val)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            border: heroCarouselSpeed === preset.val ? '1px solid #2563EB' : '1px solid #CBD5E1',
                                                            background: heroCarouselSpeed === preset.val ? '#EFF6FF' : '#FFFFFF',
                                                            color: heroCarouselSpeed === preset.val ? '#1D4ED8' : '#475569'
                                                        }}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hero Images Gallery Manager */}
                                <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ImageIcon size={18} color="#2563EB" />
                                                Hero Image Gallery ({heroImages.length} {heroImages.length === 1 ? 'image' : 'images'})
                                            </h3>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                                                {heroCarouselEnabled 
                                                    ? 'These images will be displayed in the automated rotating slideshow.' 
                                                    : 'The primary cover image will be displayed on the storefront hero section.'}
                                            </div>
                                        </div>

                                        {/* Upload from Computer Button */}
                                        <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                            <Upload size={16} />
                                            {uploading ? 'Uploading to Cloud...' : 'Upload Image from Computer'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>

                                    {/* Add via URL bar */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                        <input
                                            type="text"
                                            className="admin-form-control"
                                            placeholder="Or enter direct image URL (e.g. Cloudinary, /images/hero.webp)"
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                                        />
                                        <button
                                            type="button"
                                            className="admin-btn admin-btn-secondary"
                                            onClick={handleAddImageUrl}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            Add Image URL
                                        </button>
                                    </div>

                                    {/* Gallery Image Grid */}
                                    {heroImages.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                                            <ImageIcon size={36} color="#94A3B8" style={{ marginBottom: '8px' }} />
                                            <div style={{ fontWeight: 600 }}>No hero images added yet</div>
                                            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Upload an image above to populate the hero section.</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                            {heroImages.map((imgUrl, idx) => {
                                                const isPrimary = imgUrl === heroImage || idx === 0;
                                                return (
                                                    <div
                                                        key={`${imgUrl}-${idx}`}
                                                        style={{
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: isPrimary ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                                            background: '#F8FAFC',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                            display: 'flex',
                                                            flexDirection: 'column'
                                                        }}
                                                    >
                                                        <div style={{ position: 'relative', height: '140px', background: '#0F172A' }}>
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Hero Slide ${idx + 1}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                            <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                                                                {isPrimary ? (
                                                                    <span style={{ background: '#2563EB', color: '#FFF', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                                        ★ Primary Cover
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#FFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                                                                        Slide #{idx + 1}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', gap: '8px', flexWrap: 'wrap' }}>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveHeroImage(idx, -1)}
                                                                    disabled={idx === 0}
                                                                    title="Move Earlier"
                                                                    style={{ padding: '4px 8px', background: idx === 0 ? '#F1F5F9' : '#E2E8F0', border: 'none', borderRadius: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#94A3B8' : '#1E293B' }}
                                                                >
                                                                    <ArrowLeft size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveHeroImage(idx, 1)}
                                                                    disabled={idx === heroImages.length - 1}
                                                                    title="Move Later"
                                                                    style={{ padding: '4px 8px', background: idx === heroImages.length - 1 ? '#F1F5F9' : '#E2E8F0', border: 'none', borderRadius: '4px', cursor: idx === heroImages.length - 1 ? 'not-allowed' : 'pointer', color: idx === heroImages.length - 1 ? '#94A3B8' : '#1E293B' }}
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                {!isPrimary && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetPrimaryCover(idx)}
                                                                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                                                    >
                                                                        Set as Cover
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveHeroImage(idx)}
                                                                    style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                                    title="Delete image"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Video Playlist Section (Active if video mode selected) */}
                        {heroMediaType === 'video' && (
                            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Video size={18} color="#2563EB" />
                                    Hero Video Playlist ({heroVideos.length} videos)
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                                    {heroVideos.map((url, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.88rem', fontFamily: 'monospace' }}>{url}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVideo(idx)}
                                                style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        placeholder="Add video URL (e.g. /videos/hero-background1.mp4 or CDN URL)"
                                        value={newVideoUrl}
                                        onChange={(e) => setNewVideoUrl(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={handleAddVideo}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        Add Video
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Hero Subtitle Content Customization */}
                        <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Hero Subtitle / Description</label>
                            <textarea
                                className="admin-form-control"
                                rows={3}
                                value={heroSubtitle}
                                onChange={(e) => setHeroSubtitle(e.target.value)}
                                placeholder="Custom 3D printing services in India for personalized gifts, décor and prototypes..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: THEME & COLOR CUSTOMIZER */}
            {activeTab === 'theme' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    <div className="admin-card" style={{ padding: '24px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--admin-border)' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={20} color="#3B82F6" />
                            Header & Marquee Theme Customizer
                        </h2>
                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Customize the background and text colors of the marquee ticker and header bar according to your hero image or seasonal campaign.
                        </p>

                        {/* 1-Click Theme Presets */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                                1-Click Theme Presets:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                {THEME_PRESETS.map((preset, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleApplyPreset(preset)}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--admin-border)',
                                            background: '#F8FAFC',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>{preset.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '10px' }}>{preset.desc}</div>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.headerBgColor, border: '1px solid #CBD5E1' }} title="Header Scrolled Color" />
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.marqueeBgColor, border: '1px solid #CBD5E1' }} title="Marquee Background" />
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.marqueeAccentColor }} title="Marquee Accent" />
                                            <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600, marginLeft: 'auto' }}>Apply Preset</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Color Pickers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Marquee Background (CSS Color / Gradient)
                                </label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    value={marqueeBgColor}
                                    onChange={(e) => setMarqueeBgColor(e.target.value)}
                                    placeholder="#0F172A or linear-gradient(...)"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Marquee Main Text Color
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={marqueeTextColor.startsWith('#') ? marqueeTextColor : '#F1F5F9'}
                                        onChange={(e) => setMarqueeTextColor(e.target.value)}
                                        style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid var(--admin-border)', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        value={marqueeTextColor}
                                        onChange={(e) => setMarqueeTextColor(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Marquee Highlight / Accent Color
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={marqueeAccentColor.startsWith('#') ? marqueeAccentColor : '#60A5FA'}
                                        onChange={(e) => setMarqueeAccentColor(e.target.value)}
                                        style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid var(--admin-border)', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        value={marqueeAccentColor}
                                        onChange={(e) => setMarqueeAccentColor(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Header Scrolled Background Color
                                </label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    value={headerBgColor}
                                    onChange={(e) => setHeaderBgColor(e.target.value)}
                                    placeholder="rgba(255, 255, 255, 0.98) or #0F172A"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                                    Header Scrolled Text Color
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={headerTextColor.startsWith('#') ? headerTextColor : '#0F172A'}
                                        onChange={(e) => setHeaderTextColor(e.target.value)}
                                        style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid var(--admin-border)', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        className="admin-form-control"
                                        value={headerTextColor}
                                        onChange={(e) => setHeaderTextColor(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Visual Simulation Preview */}
                        <div style={{ marginTop: '20px', border: '1px solid #CBD5E1', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ background: '#1E293B', color: '#FFF', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye size={16} /> Live Visual Preview (Header + Marquee Bar)
                            </div>
                            
                            {/* Simulated Scrolled Header */}
                            <div style={{ background: headerBgColor, color: headerTextColor, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>Print-IN 3D</span>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <span>Shop</span>
                                    <span>About</span>
                                    <span>Contact</span>
                                </div>
                            </div>

                            {/* Simulated Marquee Bar */}
                            {marqueeEnabled ? (
                                <div style={{ background: marqueeBgColor, color: marqueeTextColor, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', borderBottom: `1px solid ${marqueeBorderColor}` }}>
                                    <Sparkles size={14} color={marqueeAccentColor} />
                                    <span style={{ padding: '2px 8px', borderRadius: '999px', background: 'rgba(59, 130, 246, 0.2)', color: marqueeAccentColor, fontSize: '0.7rem', fontWeight: 700 }}>
                                        Preview
                                    </span>
                                    <span>Free Shipping on Orders</span>
                                    <span style={{ color: marqueeAccentColor, fontWeight: 700 }}>Above ₹500</span>
                                    <span style={{ color: marqueeAccentColor }}>✦</span>
                                    <span>Exclusive Deals</span>
                                    <span style={{ color: marqueeAccentColor, fontWeight: 700 }}>Available Now</span>
                                </div>
                            ) : (
                                <div style={{ padding: '12px', background: '#F8FAFC', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                    Marquee is currently disabled (hidden on website)
                                </div>
                            )}

                            {/* Simulated Hero background sample */}
                            <div style={{ height: '110px', position: 'relative', overflow: 'hidden', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {heroMediaType === 'image' && (heroImage || heroImages[0]) ? (
                                    <>
                                        <img
                                            src={heroImage || heroImages[0]}
                                            alt="Hero preview"
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
                                        />
                                        <div style={{ position: 'relative', zIndex: 2, background: 'rgba(15, 23, 42, 0.75)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(6px)' }}>
                                            {heroCarouselEnabled && heroImages.length > 1 ? (
                                                <>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                                                    <span style={{ fontWeight: 600 }}>Slideshow Active: {heroImages.length} Images ({heroCarouselSpeed}s Interval)</span>
                                                </>
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>Single Hero Cover Banner</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                                        {heroMediaType === 'video' ? `[ Cinematic Video Background (${heroVideos.length} clips) ]` : '[ Hero Section Background Area ]'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHeroSettings;
