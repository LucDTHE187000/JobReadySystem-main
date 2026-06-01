/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [key, language, defaultValue]
 * Description: Helper function để lấy message đa ngôn ngữ từ i18n dictionary
 */

const messages = {
    en: {
        'auth.login_success': 'Login successful',
        'auth.register_success': 'Registration successful',
        'auth.invalid_credentials': 'Invalid email or password',
        'auth.email_already_exists': 'Email already registered',
        'auth.email_not_verified': 'Email not verified',
        'auth.account_disabled': 'Your account has been disabled',
        'auth.no_token': 'No authentication token',
        'auth.token_expired': 'Token expired',
        'auth.invalid_token': 'Invalid token',
        'cv.upload_success': 'CV uploaded successfully',
        'cv.upload_error': 'Error uploading CV',
        'cv.analyzing': 'Analyzing CV...',
        'cv.select_file': 'Please select a file',
        'cv.file_type_error': 'Only PDF files are allowed',
        'cv.file_size_error': 'File size must be less than 5MB',
        'interview.start_success': 'Interview session created',
        'interview.session_not_found': 'Interview session not found',
        'interview.all_questions_answered': 'All questions have been answered',
        'interview.submit_success': 'Answer submitted successfully',
        'validation.required': 'This field is required',
        'validation.invalid_email': 'Invalid email format',
        'error.server': 'Server error. Please try again later',
        'error.not_found': 'Resource not found',
        'error.unauthorized': 'Unauthorized',
    },
    vi: {
        'auth.login_success': 'Đăng nhập thành công',
        'auth.register_success': 'Đăng ký thành công',
        'auth.invalid_credentials': 'Email hoặc mật khẩu không chính xác',
        'auth.email_already_exists': 'Email đã được đăng ký',
        'auth.email_not_verified': 'Email chưa được xác thực',
        'auth.account_disabled': 'Tài khoản của bạn đã bị vô hiệu hóa',
        'auth.no_token': 'Không có token xác thực',
        'auth.token_expired': 'Token hết hạn',
        'auth.invalid_token': 'Token không hợp lệ',
        'cv.upload_success': 'Tải lên CV thành công',
        'cv.upload_error': 'Lỗi khi tải lên CV',
        'cv.analyzing': 'Đang phân tích CV...',
        'cv.select_file': 'Vui lòng chọn một tệp',
        'cv.file_type_error': 'Chỉ chấp nhận tệp PDF',
        'cv.file_size_error': 'Kích thước tệp phải nhỏ hơn 5MB',
        'interview.start_success': 'Phiên phỏng vấn đã được tạo',
        'interview.session_not_found': 'Không tìm thấy phiên phỏng vấn',
        'interview.all_questions_answered': 'Tất cả câu hỏi đã được trả lời',
        'interview.submit_success': 'Gửi câu trả lời thành công',
        'validation.required': 'Trường này không được để trống',
        'validation.invalid_email': 'Định dạng email không hợp lệ',
        'error.server': 'Lỗi máy chủ. Vui lòng thử lại sau',
        'error.not_found': 'Không tìm thấy tài nguyên',
        'error.unauthorized': 'Không có quyền truy cập',
    }
};

/**
 * Lấy message đa ngôn ngữ
 * @param {String} key - Message key (e.g., 'auth.login_success')
 * @param {String} language - Language code (en/vi)
 * @param {String} defaultValue - Default message if key not found
 * @returns {String} - Translated message
 */
export function getMessage(key, language = 'en', defaultValue = key) {
    const lang = language?.toLowerCase() || 'en';
    const validLang = messages[lang] ? lang : 'en';
    return messages[validLang][key] || defaultValue;
}

export default { getMessage };
