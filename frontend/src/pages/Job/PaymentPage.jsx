import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Copy, Building2 } from 'lucide-react';
import axios from 'axios';
import SeekerLayout from '../../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const BANK_INFO = {
    bank: 'BIDV',
    accountNumber: '8898106444',
    accountName: 'DUONG TRONG LUC',
};

const PaymentPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, refreshUser } = useAuth();
    const creditAmount = Number(id) || 10000;
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState('');

    const transferContent = `JOBREADY ${user?.email || 'USER'}`;

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/users/credits/topup`,
                { amount: creditAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (refreshUser) await refreshUser();
            alert(`Nạp ${creditAmount.toLocaleString('vi-VN')} credit thành công`);
            navigate('/profile');
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi nạp credit');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/pricing');
    };

    return (
        <SeekerLayout title="Thanh toán" breadcrumb="Gói › Nạp credit">
            <div className="max-w-lg mx-auto w-full">
                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 text-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-heading text-3xl text-slate-800 font-bold">THANH TOÁN</h1>
                        <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            Bảo mật & An toàn
                        </span>
                    </div>

                    {id && (
                        <p className="text-sm text-slate-500 mb-6">
                            Mã giao dịch: <span className="font-mono font-semibold text-slate-800">{id}</span>
                        </p>
                    )}

                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#0A2463]" />
                        Chuyển khoản ngân hàng
                    </h2>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 mb-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-blue-600 font-bold text-xs">BIDV</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{BANK_INFO.bank}</p>
                                    <p className="text-xs text-slate-500">VietQR PRO</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                                Đã liên kết
                            </span>
                        </div>

                        {[
                            { label: 'Ngân hàng', value: BANK_INFO.bank, field: 'bank' },
                            { label: 'Số tài khoản', value: BANK_INFO.accountNumber, field: 'stk' },
                            { label: 'Tên tài khoản', value: BANK_INFO.accountName, field: 'name' },
                            { label: 'Nội dung CK', value: transferContent, field: 'content' },
                        ].map(({ label, value, field }) => (
                            <div key={field} className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                    <p className="font-semibold text-slate-800 text-sm">{value}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(value, field)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors flex-shrink-0"
                                    title="Sao chép"
                                >
                                    <Copy className="w-4 h-4" />
                                    {copied === field && <span className="sr-only">Đã copy</span>}
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        Sau khi chuyển khoản thành công, số credit sẽ được cộng trực tiếp vào số dư credit của user đó.
                    </p>

                    <span className="inline-block mb-6 px-3 py-1 bg-[#F5C518]/15 text-[#0A2463] text-xs font-bold rounded-full border border-[#F5C518]/30">
                        Hỗ trợ PayOS
                    </span>

                    <div className="space-y-3">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full py-3.5 bg-[#0A2463] text-white font-bold rounded-xl hover:bg-[#071A4A] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </SeekerLayout>
    );
};

export default PaymentPage;
