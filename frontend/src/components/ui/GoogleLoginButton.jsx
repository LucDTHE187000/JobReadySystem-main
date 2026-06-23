import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton({ role, onSuccessCallback, code }) {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const buttonRef = useRef(null);

    // Dùng ref để lưu trữ giá trị role và callback mới nhất nhằm tránh re-run useEffect khi chúng thay đổi
    const roleRef = useRef(role);
    const callbackRef = useRef(onSuccessCallback);
    const codeRef = useRef(code);

    useEffect(() => {
        roleRef.current = role;
    }, [role]);

    useEffect(() => {
        callbackRef.current = onSuccessCallback;
    }, [onSuccessCallback]);

    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    useEffect(() => {
        let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        
        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts && window.google.accounts.id && buttonRef.current) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                if (!clientId) {
                    console.error("VITE_GOOGLE_CLIENT_ID is not configured in frontend .env");
                    setError("Chưa cấu hình Google Client ID");
                    return;
                }

                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: async (response) => {
                            setLoading(true);
                            setError('');
                            try {
                                const result = await signInWithGoogle(response.credential, roleRef.current, codeRef.current);
                                if (result.error) {
                                    setError(result.error.message || 'Đăng nhập Google thất bại');
                                } else {
                                    if (callbackRef.current) {
                                        callbackRef.current(result.user);
                                    } else {
                                        // Default navigation logic
                                        navigate('/', { replace: true });
                                    }
                                }
                            } catch (err) {
                                console.error(err);
                                setError('Đã xảy ra lỗi khi đăng nhập');
                            } finally {
                                setLoading(false);
                            }
                        }
                    });

                    window.google.accounts.id.renderButton(
                        buttonRef.current,
                        { 
                            theme: 'outline', 
                            size: 'large', 
                            width: '320',
                            text: 'signin_with',
                            shape: 'pill',
                            logo_alignment: 'left'
                        }
                    );
                } catch (err) {
                    console.error("Google accounts initialization error:", err);
                    setError("Trình duyệt hoặc tiện ích mở rộng chặn quảng cáo đã ngăn cản tải Google Login. Vui lòng tắt trình chặn quảng cáo và thử lại.");
                }
            } else if (window.google && (!window.google.accounts || !window.google.accounts.id)) {
                setError("Trình duyệt hoặc tiện ích mở rộng chặn quảng cáo đã ngăn cản tải Google Login. Vui lòng tắt trình chặn quảng cáo và thử lại.");
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.body.appendChild(script);
        } else {
            if (window.google) {
                initializeGoogleSignIn();
            } else {
                script.addEventListener('load', initializeGoogleSignIn);
            }
        }

        return () => {
            if (script) {
                script.removeEventListener('load', initializeGoogleSignIn);
            }
        };
    }, [signInWithGoogle, navigate]);

    return (
        <div className="w-full flex flex-col items-center justify-center my-3">
            {error && (
                <div className="text-xs text-red-500 mb-2 font-medium bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg w-full text-center">
                    {error}
                </div>
            )}
            {loading && (
                <div className="flex items-center justify-center space-x-2 py-2 text-sm text-gray-500 animate-pulse w-full mb-2">
                    <div className="w-4 h-4 border-2 border-[#0A2463] border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác thực với hệ thống...</span>
                </div>
            )}
            <div 
                ref={buttonRef} 
                id="googleSignInDiv" 
                className={`w-full flex justify-center min-h-[44px] ${loading ? 'pointer-events-none opacity-50' : ''}`}
            />
        </div>
    );
}
