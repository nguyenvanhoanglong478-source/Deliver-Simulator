# Nhật ký thay đổi

## Gần nhất
- Đơn bị khách hủy không tạo đánh giá và không đổi số sao.
- Màn đổ xăng/nghỉ ngơi giữ thêm 1,5 giây khi xong; thanh xăng luôn đầy đúng mức đã chọn.
- Animation đổ xăng mới: cảnh trạm xăng, vòi xăng chạy, thanh đo 10 ô, số % đếm mượt.
- Nhạc nền: 1 bài lặp ở màn hình bắt đầu, 4 bài tự chuyển trong game; nút loa mở cài đặt (bật/tắt, chọn bài, âm lượng); lưu ở `btd_audio`.
- Icon vẽ lại 16x16 (mặt trăng, cúp đối xứng, v.v.); sửa HUD và font tiếng Việt trên mobile.

## Gameplay lớn
- Chọn đơn (3-4 đơn/lượt, gần/vừa/xa, đơn gấp), 2 minigame (bắt gói, né vật cản), tốc độ lái, giờ cao điểm.
- Mốc tiết kiệm 25/50/75 triệu, nâng cấp có đánh đổi (túi/động cơ loại trừ nhau, phí tháng cho GPS và bảo hiểm), thưởng cuối tháng theo đơn và sao, màn kết "Tiền đi đâu?".
- Cân bằng: hóa đơn 6,5 triệu/tháng, thu nhập đơn đồ ăn 25k-50k và hàng hóa 50k-110k, lãi 0,2%/ngày.
- Tải lại trang giữa lúc giao hoặc đổ xăng không hoàn lại thể lực, xăng, tiền.

## Nền tảng
- Giao diện retro 8-bit, hồ sơ tài xế, đánh giá khách (56 câu mẫu + Claude viết nếu có).
- GPS giảm một nửa kẹt xe/hủy đơn; thắng/thua dọn trạng thái; lưu/tải bền (`btd_v2`); kiểm thử Playwright trong `tests/`.

## Cài đặt hiện tại
- Số trận: 24 tháng x 30 ngày; ngày game 300 giây thật (06:00-22:00).
- Khóa lưu: `btd_v2` (game), `btd_audio` (nhạc: bật/tắt, âm lượng, bài).
- Chạy test: `python3 tests/test_gameplay.py`, `test_save_load.py`, `test_features.py`, `test_audio.py` (chạy riêng từng file).

## Pause button
- Floating pause button (bottom-left) on the main game screen and during mini-games; also P / Esc.
- Freezes the day clock and the mini-game timers (timestamps are shifted on resume, so no time is lost); settings are reachable from the pause dialog.
- tests/test_pause.py (16 checks).
