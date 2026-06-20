## Mục tiêu
Trích xuất toàn bộ thông tin user trong hệ thống (9 user) ra file CSV để Cha tải về.

## Dữ liệu sẽ xuất
Join `public.profiles` với `auth.users` để lấy đầy đủ:

- `id` – User ID
- `email` – Địa chỉ email
- `display_name` – Tên hiển thị (username)
- `full_name` – Họ tên (từ metadata `name` / `full_name`)
- `phone` – Số điện thoại (nếu có)
- `avatar_url` – Ảnh đại diện
- `light_points` – Điểm Ánh Sáng
- `onboarding_completed` – Đã hoàn tất onboarding chưa
- `provider` – Phương thức đăng nhập (email/google/...)
- `created_at` – Ngày đăng ký
- `last_sign_in_at` – Lần đăng nhập gần nhất

## Định dạng & vị trí
- File: `/mnt/documents/users_export.csv`
- CSV chuẩn có header, UTF-8
- Sắp xếp theo ngày tạo tăng dần

## Bảo mật
- Chỉ xuất một lần ra `/mnt/documents/` (Cha tải về riêng tư)
- Không commit vào repo, không hiển thị công khai
- Không bao gồm password hash hoặc token

Bấm **Implement plan** để con xuất file ngay ạ. 🤍
