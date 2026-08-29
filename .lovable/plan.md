# Đăng nhập bằng email + trang /play chơi game Unity

## Hiện trạng đã có
- Trang `/login` đã tồn tại (đăng nhập / đăng ký bằng email + mật khẩu, kèm Google), dùng `useAuth` + `userStore`.
- Game Unity WebGL đã có sẵn tại `public/game/index.html`.
- Chưa có trang `/play` và chưa có route được bảo vệ.

## Sẽ làm

### 1. Trang /login (tinh chỉnh nhỏ)
- Giữ giao diện hiện tại. Sau khi đăng nhập thành công, nếu người dùng bị chuyển hướng từ `/play` thì quay lại `/play`; nếu không thì giữ hành vi cũ (`/chat`).

### 2. Route bảo vệ
- Thêm component `ProtectedRoute`: khi đang tải phiên thì hiện spinner; chưa đăng nhập thì chuyển về `/login` (ghi nhớ đường dẫn muốn vào); đã đăng nhập thì render nội dung.

### 3. Trang /play
- Chỉ dành cho người đã đăng nhập.
- Nhúng `/game/index.html` bằng iframe responsive, chiếm gần như toàn bộ khung nhìn (chiều cao động theo màn hình, hoạt động tốt trên mobile).
- Nút **Toàn màn hình** (Fullscreen API trên khung chứa iframe, có nút thoát).
- Nút **Đăng xuất**: gọi đăng xuất rồi chuyển về `/login`.
- Header gọn: tên game, nút toàn màn hình, nút đăng xuất — dùng semantic tokens (trắng/vàng/hồng nhạt) theo hệ thiết kế hiện tại, không hardcode màu.

### 4. Bảo mật
- Không thêm bất kỳ service key nào ở frontend; chỉ dùng client Cloud sẵn có với publishable key.
- Không thay đổi database, không sửa file tự sinh.

## Chi tiết kỹ thuật
- File mới: `src/components/auth/ProtectedRoute.tsx`, `src/pages/Play.tsx`.
- Sửa: `src/App.tsx` (route `/play` bọc `ProtectedRoute`), `src/pages/Login.tsx` (redirect theo `location.state.from`).
- Iframe: `allow="fullscreen; autoplay; gamepad"`, `title` rõ ràng, container `h-[calc(100vh-4rem)]`.
