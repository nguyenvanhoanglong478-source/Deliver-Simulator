# Nhật ký thay đổi

## Gần nhất
- Màn bắt đầu luôn vừa khít cửa sổ (không phải kéo xuống để bấm BẮT ĐẦU): bỏ đệm đáy 84px, thu nhỏ ảnh/chữ khi cửa sổ thấp, chia 2 cột khi rộng mà thấp (ví dụ PC thu phóng 150%, điện thoại nằm ngang). Test mới tests/test_startfit.py.
- Layout: thanh Sức khỏe / Gia đình riêng ở màn chính, bảng ĐỜI SỐNG chia mục rõ ràng (nút không còn tràn trên mobile, rộng hơn trên PC), nút ĐỜI SỐNG tách khỏi khối hành động.
- Rà soát logic life-sim: cảm lạnh sau hôm mưa (trước đó không bao giờ xảy ra), "hết tiền ăn" chỉ khi thật sự hết tiền và tiết kiệm, sự kiện đang mở được lưu và hiện lại khi tải lại trang, trả hết nợ là thắng ngay, tháng cuối trả nợ bằng tiền mặt trước, hướng dẫn thêm trang ĐỜI SỐNG.
- Life-sim giai đoạn 5: cốt truyện 4 chương (tháng 1/7/13/19), sự kiện gia đình theo tháng 3/9/15/21 (mái nhà dột, em đóng học phí, mẹ nhập viện, bạn rủ góp vốn), kết thúc nhiều kiểu theo cách sống, hiển thị mức khắc nghiệt. Cân bằng lại: tiền đơn tăng khoảng 20% (đồ ăn 30k-60k, hàng hóa 60k-130k); mô phỏng Monte-Carlo cho người giỏi thắng ~50%, người trung bình ~12%.
- Life-sim giai đoạn 4: vay (bạn không lãi, vay nóng 15%, app 25% có phí), lãi cộng dồn hàng tháng, người đòi nợ, nợ từ 30TR bị siết (thua), phải hết nợ mới thắng; vé số (trúng nhỏ/lớn/độc đắc), sự kiện hết tiền ăn.
- Life-sim giai đoạn 3: lời mời nhậu / đánh bài / tò mò cá cược (sự kiện nhỏ, có giá), thanh thói quen rượu và cờ bạc, thèm, mệt sau rượu, gan yếu; nút "tự nhủ bớt lại" mỗi tháng một lần.
- Life-sim giai đoạn 2: menu ĐỜI SỐNG (gửi tiền về quê, mua/bán vàng và chứng khoán, biến động theo tháng, tự bán vào tiết kiệm khi hết 24 tháng); gia đình lo dần mỗi tháng.
- Life-sim giai đoạn 1: mức khắc nghiệt ngẫu nhiên (ẩn, hiện ở màn thắng/thua), chỉ số sức khỏe/gia đình/nợ, engine sự kiện có lựa chọn (cảm lạnh, mẹ gọi), ốm thì không nhận đơn được.
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

## Engineering pass (packaging, game clock, canvas, validation, offline)
- Music and fonts are separate files: `index.html` went from 5.6 MB to about 400 KB. `python3 build.py --artifact FILE` still builds a one-file embedded version for Claude artifacts.
- Bundled fonts (VT323 incl. Vietnamese subset, Press Start 2P), no Google Fonts request.
- Service worker + web manifest + icons: offline play and installable (precaches the shell and fonts, caches music on first play with Range support).
- `src/loop.js`: a single game clock replaces every setInterval/setTimeout of the game; pause is one switch and now also works during delivery, refuel and sleep animations (light overlay, no re-render). Hidden tab pauses.
- Dodge and Route Rush road drawn on canvas (smooth frame-by-frame, scrolling road); canvas particle bursts on successful delivery and on winning.
- `src/state.js`: JSDoc state shape, `stateProblems()` / `repairState()`; `save()` repairs and warns instead of writing a broken state.
- New tests: test_loop (14), test_state (23), test_offline (20).

## Shop price cells
- Price / owned / locked cells on the Upgrade page are now all exactly 128x38 on phones and desktop (they used to size by their text, 51-118 px wide and two different heights). Removed the conflicting CSS rules. Test added in test_ux.py (21 checks).
