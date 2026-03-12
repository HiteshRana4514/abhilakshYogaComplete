import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteName = 'Abhilaksh Yoga Academy';
    const defaultDescription = 'Abhilaksh Yoga Academy in Amritsar offers expert-led Hatha, Power, and Ashtanga yoga classes for all levels. Join us for a transformative journey to wellness.';
    const defaultKeywords = 'Yoga Amritsar, Yoga Academy Amritsar, Best Yoga Classes Amritsar, Hatha Yoga, Power Yoga, Meditation Amritsar, Yoga Teacher Training';
    const defaultImage = '/logo.png';
    const currentUrl = url || window.location.href;

    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <meta name="author" content={siteName} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
