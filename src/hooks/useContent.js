import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase';

/**
 * Hook to fetch and manage site content for a specific page.
 * @param {string} page - The page name (e.g., 'home', 'about', 'global')
 * @returns {object} - { content, loading, error, refresh }
 */
export const useContent = (page) => {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from(TABLES.SITE_CONTENT)
                .select('*')
                .eq('page', page);

            if (fetchError) throw fetchError;

            // Transform array into nested object structure: { section: { key: value } }
            const contentMap = (data || []).reduce((acc, item) => {
                if (!acc[item.section]) acc[item.section] = {};

                let value = item.value;
                // Handle cases where strings might be double-wrapped in quotes in JSONB
                if (typeof value === 'string') {
                    value = value.replace(/^"(.*)"$/, '$1');
                }

                acc[item.section][item.key] = value;
                return acc;
            }, {});

            setContent(contentMap);
        } catch (err) {
            console.error(`Error fetching site content for page [${page}]:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    return { content, loading, error, refresh: fetchContent };
};
