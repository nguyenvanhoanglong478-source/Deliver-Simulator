# Be The Driver (Deliver Simulator)

Game mô phỏng tài xế giao hàng bằng xe máy, phong cách retro 8-bit. Chạy trực tiếp trên trình duyệt, không cần cài đặt.

**Mục tiêu:** tiết kiệm 100 triệu đồng trong 24 tháng, trong khi vẫn trả đủ chi phí sinh hoạt mỗi tháng.

## Chơi

Mở `index.html` bằng trình duyệt. Tiến trình được lưu trong `localStorage`.

- Nhận đơn đồ ăn hoặc hàng hóa, hoàn thành mini game bắt gói hàng trong 20 giây.
- Quản lý thể lực, xăng và độ bền xe. Đổ xăng bằng thanh trượt, tiền tính theo %.
- Gửi tiền tiết kiệm để nhận lãi mỗi ngày (0,1%).
- Mở **Hồ sơ tài xế** (bấm vào avatar) để đổi tên, sở thích, màu mũ, xem số sao và đánh giá của khách.
- Khi mở game trong Claude (artifact), mỗi đánh giá có thể do Claude viết theo sở thích của bạn. Nơi khác dùng đánh giá có sẵn.

## Cấu trúc

- `index.html`: bản đã đóng gói, một file duy nhất.
- `src/`: mã nguồn (`style.css`, `icons.js`, `profile.js`, `logic.js`, `render.js`, `bike.png`).
- `build.py`: ghép `src/` thành `index.html` (`python3 build.py`).
- `tests/`: kiểm thử bằng trình duyệt (Playwright): `python3 tests/test_gameplay.py`, `python3 tests/test_save_load.py`.

Phông chữ (VT323, Press Start 2P) tải từ Google Fonts; khi không có mạng game dùng phông monospace thay thế.
