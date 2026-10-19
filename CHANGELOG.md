# Nhật ký thay đổi

## Gần nhất
- Sửa lỗi bản cũ bị kẹt trên trình duyệt (GitHub Pages / cài như app): trang chính giờ ưu tiên tải từ mạng (có kiểm tra bản mới), chỉ dùng bản lưu khi mất mạng hoặc mạng quá chậm (3 giây); cache khi cài đặt cũng bỏ qua cache HTTP. Trước đây service worker ưu tiên bản lưu nên bản sửa lỗi có thể không hiện dù tải lại nhiều lần. Thêm dòng "Phiên bản ..." trong hộp ÂM THANH để biết đang chạy bản nào.
- Sửa blackjack: sau mỗi ván bấm chip tiền cược (50K...2TR) không có tác dụng, chỉ chỉnh được ở lần cược đầu. Giờ chỉnh được giữa các ván; test chuột thật (53 kiểm tra).
- Sửa lỗi nút blackjack: sau khi thua, hạn mức cược (20% tiền mặt) giảm nhưng mức cược cũ vẫn giữ nên nút "VÁN MỚI" bị khóa mà nhãn vẫn ghi số tiền. Giờ mức cược tự hạ xuống chip lớn nhất còn hợp lệ. Nút tách bài đổi tên "TÁCH ĐÔI BÀI" (trước trùng tên "CHIA BÀI" với nút chia bài), nút gấp đôi / tách chỉ hiện khi dùng được, nút rút đổi thành "RÚT THÊM". Test bằng chuột thật (51 kiểm tra).
- Thêm SÒNG BÀI blackjack trong mục ĐỜI SỐNG, chơi được ngay từ đầu game. Luật chuẩn: bộ bài mới xáo mỗi ván, nhà cái dừng ở 17, blackjack trả 3:2, có rút / dằn / gấp đôi / chia bài. Tối đa 5 ván mỗi ngày, mỗi ván tốn 10 giây trong ngày, cược tối đa 20% tiền mặt (từ 50K), mỗi ván tăng chỉ số cờ bạc +2. Thắng thua hoàn toàn ngẫu nhiên và công bằng (không phụ thuộc độ khó hay chỉ số). Thua 3 ván liền thì hỏi "đứng dậy hay gỡ lại"; gỡ lại mà thua tiếp thì gia đình -3 mỗi lần, hết tiền thì hiện nút vay nóng. Tiền cược trừ ngay khi chia bài (tải lại trang không hoàn). Test mới `tests/test_blackjack.py`.
- Vẽ thêm chi tiết giao diện: cảnh phố sống động ở màn chính (mặt trời/trăng đi theo giờ trong ngày, bình minh/hoàng hôn/ban đêm, mưa rơi khi trời mưa, cảnh chỉ chạy khi đang giao), ô đơn đang giao có đường chạy với xe máy tiến về lá cờ, chấm báo độ xa, đơn gấp nhấp nháy viền, nền có ánh sáng, đường chân trời và sao, panel có chuyển sắc nổi khối, thanh chỉ số có sọc chéo, logo nhấp nháy neon.
- Đánh giá mới ở màn chính nhấp nháy viền vàng ~3 giây; hồ sơ tài xế chỉ hiện 10 đánh giá gần nhất.
- Đang giao hàng vẫn mở được Nâng cấp / Đời sống / Hồ sơ; nâng cấp mua giữa chừng chỉ có hiệu lực từ đơn kế tiếp (đơn đang giao tính theo nâng cấp lúc bắt đầu). Đơn xong khi đang mở popup thì chờ đóng popup rồi mới tính.
- Chữ in nghiêng (THỂ LỰC, XĂNG...) về bình thường. Nút âm thanh luôn hiển thị.
- Bỏ hẳn 3 minigame (bắt gói, né xe, tìm đường). Bấm đơn nào thì ô đơn đó hiện "ĐANG GIAO", thời gian còn lại và thanh tiến độ (gần ~6s, vừa ~10s, xa ~15s; lái chậm lâu hơn, lái nhanh/đơn gấp nhanh hơn). Mỗi lần chỉ giao 1 đơn, các ô khác khóa. Thêm ĐƠN GHÉP (trả x1,75, lâu x1,6, tốn x1,5 thể lực/xăng). Tập trung vào sự kiện, cốt truyện, ending.
- Cân bằng lại vì giao nhanh gấp ~2,4 lần: tiền công đơn x0,55, mốc thưởng tháng 240/360/480 đơn (trước 100/150/200). Đã xóa `test_route.py`, `test_catch.py`.
- Minigame bắt gói tự hoàn thành ngay khi bắt đủ gói, không phải đợi hết giờ (đơn gấp cũng vậy).
- Nghỉ ngơi cộng +5 thể lực mỗi giây (trước là +2). Mô phỏng cân bằng: người giỏi thắng ~65%, khá ~25%, trung bình ~1%.
- Mục TIẾT KIỆM ở bản mobile luôn hiện, không còn phải mở ra.
- Vé số mua trong mục ĐỜI SỐNG (tối đa 40 tờ/ngày), xổ vào cuối ngày. Giá vàng/chứng khoán đổi mỗi ngày, bảng cuối ngày hiện lãi/lỗ hôm nay và tổng lãi/lỗ so với vốn. Các mục trong ĐỜI SỐNG tách thành thẻ riêng, cách xa hơn.
- Menu tạm dừng có thêm "VỀ MÀN HÌNH BẮT ĐẦU" (hỏi xác nhận, game vẫn lưu và bấm TIẾP TỤC để chơi tiếp; đơn đang giao bị hủy, tài nguyên đã dùng không hoàn lại giống như tải lại trang). Có ở cả menu tạm dừng thường và khi đang chạy hoạt ảnh.
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

## Audit
- Removed dead JS/CSS/icons, orphan CSS, stale comments; renamed mgTmr→dlvTmr. All test files pass.
- bike.png nén 64 màu: 212K → 30K, bản build 458 KB → 217 KB.
