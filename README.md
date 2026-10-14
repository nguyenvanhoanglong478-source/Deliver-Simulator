# Be The Driver (Deliver Simulator)

Game mô phỏng tài xế giao hàng bằng xe máy, phong cách retro 8-bit. Chạy trực tiếp trên trình duyệt, không cần cài đặt.

**Mục tiêu:** tiết kiệm 100 triệu đồng trong 24 tháng, trong khi vẫn trả đủ chi phí sinh hoạt mỗi tháng.

## Chơi

Mở `index.html` bằng trình duyệt. Tiến trình được lưu trong `localStorage`.

- Mỗi lượt có 3 đơn để chọn (đồ ăn/hàng hóa, gần/vừa/xa, đơn gấp). Đơn xa trả cao nhưng tốn thể lực, xăng và thời gian. "Đổi đơn" tốn 8 giây.
- Hai mini game: bắt gói hàng (20 giây) hoặc né vật cản trên đường 3 làn (chạm làn, nút ◀ ▶ hoặc phím mũi tên). Đơn gấp chỉ có 15 giây.
- Chọn tốc độ lái: chậm (ít tai nạn, thêm thời gian), thường, nhanh (nhanh hơn nhưng dễ tai nạn/bị phạt). Xe cũ dễ hỏng hơn.
- Mỗi ngày game chạy từ 06:00 đến 22:00; giờ cao điểm (11-13h, 17-19h) đơn trả nhiều hơn nhưng kẹt xe gấp đôi.
- Nâng cấp có đánh đổi: hai túi giao hàng và hai động cơ loại trừ nhau; GPS và bảo hiểm có phí hàng tháng.
- Mốc tiết kiệm 25/50/75 triệu: thưởng tiền và mở khóa nâng cấp mới.
- Cuối tháng có thưởng theo số đơn và đánh giá sao. Màn kết thúc cho biết tiền đã đi đâu.
- Quản lý thể lực, xăng và độ bền xe. Đổ xăng bằng thanh trượt, tiền tính theo %.
- Gửi tiền tiết kiệm để nhận lãi mỗi ngày (0,2%).
- Nhạc nền 8-bit: màn hình bắt đầu có một bài lặp lại; trong game có 4 bài tự chuyển tiếp và phát lại từ đầu khi hết danh sách. Trình duyệt cần một lần chạm đầu tiên mới cho phát. Nút loa ở góc dưới bên phải mở cài đặt âm thanh: bật/tắt nhạc, chọn bài trước/sau, chỉnh âm lượng (được nhớ cho lần sau).
- Mở **Hồ sơ tài xế** (bấm vào avatar) để đổi tên, sở thích, màu mũ, xem số sao và đánh giá của khách.
- Khi mở game trong Claude (artifact), mỗi đánh giá có thể do Claude viết theo sở thích của bạn. Nơi khác dùng đánh giá có sẵn.

## Cấu trúc

- `index.html`: bản đã đóng gói, một file duy nhất.
- `src/`: mã nguồn (`style.css`, `icons.js`, `audio.js`, `profile.js`, `logic.js`, `render.js`, `bike.png`, `music.mp3`, `track1-4.mp3`).
- `build.py`: ghép `src/` thành `index.html` (`python3 build.py`).
- `tests/`: kiểm thử bằng trình duyệt (Playwright): `python3 tests/test_gameplay.py`, `python3 tests/test_save_load.py`, `python3 tests/test_features.py`, `python3 tests/test_audio.py`.

Phông chữ (VT323, Press Start 2P) tải từ Google Fonts; khi không có mạng game dùng phông monospace thay thế.

Nhạc nền (do chủ dự án cung cấp, nén còn 64–80 kbps để nhúng vào index.html): "8-Bit Retro Game Music" (MoodMode) ở màn hình bắt đầu; trong game: "Waiting Time" (Lesiakower), "8-Bit Retro" (Mondamusic), "Game 8-Bit On" (MoodMode), "I Love My 8-Bit Game Console" (DJARTMUSIC).
