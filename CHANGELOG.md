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

## UX / layout pass
- Mobile shop: price button sits under the description (nothing clipped); wider description text.
- Cash / savings numbers use the larger VT323 font and stay on one line; extra bottom padding so floating buttons never cover content; floating buttons follow the content column on wide screens.
- Driving-speed row is a tidy 3-button grid on mobile, with "Đổi đơn" below.
- First-run tutorial (5 cards, remembered in `btd_tut`), also reachable from the pause dialog ("HƯỚNG DẪN").
- Reasons shown when saving / withdrawing is unavailable; confirmation before ending a day with more than 90 s left.
- Day clock follows real elapsed time (a throttled timer cannot slow it); switching to another tab pauses the game.
- tests/test_ux.py (15 checks); other tests now preset `btd_tut` so the tutorial does not block them.

## Route Rush + compact layouts
- Third mini-game, Route Rush (reworked): memorise 5 turns shown for 3 s, then steer through each junction (◀ ▲ ▶, arrow keys) before the bike arrives; wrong or missed turn = -2 s; GPS keeps the next 3 turns visible; peak hours and rush orders shorten the approach. Works with pause. (First version was a 5x6 grid map; replaced.)
- Shop rows: icon | name + price button | description (about half the height).
- Main screen on phones: three meters in one row, tighter cards, savings and log are collapsible sections (open on desktop).
- tests/test_route.py (21 checks).

## Failed orders get no good events
- A delivery that pays nothing (failed mini-game) can no longer trigger tip / VIP / Be reward events; bad events (breakdown, fine, crash) can still happen. Tests added to test_gameplay.py.
