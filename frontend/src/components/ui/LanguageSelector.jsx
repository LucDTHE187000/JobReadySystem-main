import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: N/A
 * Description: Component chọn ngôn ngữ (EN/VI) - Hiển thị dropdown với 2 tùy chọn ngôn ngữ
 */

export default function LanguageSelector({ dark = false }) {
    const { language, switchLanguage, LANGUAGES } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', name: LANGUAGES.en.label, flag: LANGUAGES.en.flag },
        { code: 'vi', name: LANGUAGES.vi.label, flag: LANGUAGES.vi.flag },
    ];

    const handleLanguageChange = (langCode) => {
        switchLanguage(langCode);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(lang => lang.code === language);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    dark
                        ? 'text-white/80 hover:bg-white/10 hover:text-gold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title="Chọn ngôn ngữ"
            >
                <Globe size={18} className={dark ? 'text-white/70' : 'text-gray-600'} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                language === lang.code
                                    ? 'bg-gold/15 text-navy font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-gold-dark">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
