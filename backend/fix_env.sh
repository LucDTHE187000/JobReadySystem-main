#!/bin/bash
# Chuyển đến thư mục chứa script này
cd "$(dirname "$0")"

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Không tìm thấy file .env tại $(pwd)!"
    exit 1
fi

echo "🔄 Đang dọn dẹp và cấu hình lại file .env..."

# Tạo file tạm thời không chứa các dòng GOOGLE_CLIENT_ID cũ
grep -v "GOOGLE_CLIENT_ID" "$ENV_FILE" > .env.tmp

# Thêm cấu hình GOOGLE_CLIENT_ID chính xác vào cuối file
echo "" >> .env.tmp
echo "GOOGLE_CLIENT_ID=859439191397-hcrn1qn5fgegjgafinupf5fgil4pur2v.apps.googleusercontent.com" >> .env.tmp

# Thay thế file .env gốc
mv .env.tmp "$ENV_FILE"

echo "✅ Đã cấu hình GOOGLE_CLIENT_ID chính xác vào file .env!"
echo "🔄 Khởi động lại backend bằng PM2..."
pm2 restart jobready-backend
echo "🎉 Hoàn tất cập nhật và khởi chạy!"
