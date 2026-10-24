# Nhật ký thay đổi / Changelog

---

## Tiếng Việt

### Các thay đổi gần nhất
- **Tối ưu hóa Service Worker & Cập nhật trang**: Trang chính hiện ưu tiên tải từ mạng (kèm kiểm tra phiên bản mới) và chỉ dùng bản lưu ngoại tuyến khi mất mạng hoặc kết nối mạng quá chậm (sau 3 giây). Quá trình cài đặt Service Worker bỏ qua cache HTTP để đảm bảo người dùng luôn nhận bản phát hành mới nhất thay vì bị kẹt bản cũ. Bổ sung thông tin phiên bản ("Phiên bản ...") trong cửa sổ cài đặt Âm thanh.
- **Sửa lỗi & Nâng cấp Sòng bài Blackjack**:
  - Cho phép điều chỉnh mức cược giữa các ván (50K - 2TR) linh hoạt bằng chip cược thay vì chỉ đặt được ở ván đầu tiên.
  - Tự động hạ mức cược xuống chip hợp lệ cao nhất khi hạn mức cược (tối đa 20% tiền mặt) sụt giảm sau ván thua, khắc phục tình trạng nút "VÁN MỚI" bị khóa vô cớ.
  - Cập nhật nhãn nút rõ ràng: "TÁCH ĐÔI BÀI", "RÚT THÊM", chỉ hiển thị nút Gấp đôi và Tách đôi khi đủ điều kiện thực hiện.
- **Bổ sung Sòng bài Blackjack vào mục ĐỜI SỐNG**:
  - Có thể tham gia ngay từ đầu trò chơi.
  - Áp dụng luật Blackjack tiêu chuẩn: xáo bộ bài 52 lá mới mỗi ván, nhà cái dừng ở 17, trả thưởng Blackjack 3:2, hỗ trợ rút, dằn, gấp đôi và tách bài.
  - Giới hạn tối đa 5 ván/ngày, mỗi ván tiêu tốn 10 giây thời gian trong ngày và tăng nhẹ chỉ số cờ bạc (+2). Kết quả hoàn toàn ngẫu nhiên và công bằng.
  - Tích hợp lựa chọn tâm lý sau chuỗi 3 ván thua liên tiếp ("đứng dậy hay gỡ lại"). Nếu cố gỡ và tiếp tục thua sẽ làm giảm chỉ số Gia đình (-3/lần); khi cạn tiền sẽ mở lựa chọn vay nóng. Tiền cược trừ trực tiếp khi chia bài.
- **Nâng cấp Đồ họa & Cảnh quan**:
  - Bổ sung cảnh quan đường phố sống động tại màn hình chính: chu kỳ mặt trời và mặt trăng di chuyển theo giờ trong ngày, hiển thị các thời điểm bình minh, ban ngày, hoàng hôn, ban đêm; hiệu ứng mưa rơi trực quan; cảnh quan phố chỉ cuộn khi đang trên đường giao hàng.
  - Thẻ đơn hàng đang giao tích hợp đường chạy mô phỏng xe máy di chuyển về đích kèm vạch tiến độ và thời gian đếm ngược.
  - Nhấp nháy viền nổi bật đối với các đơn giao gấp và đánh giá mới nhận được (trong ~3 giây). Hồ sơ tài xế hiển thị 10 đánh giá gần nhất.
- **Cải tiến luồng giao diện khi giao hàng**:
  - Người chơi vẫn có thể mở mục Nâng cấp, Đời sống hoặc Hồ sơ trong lúc xe đang chạy giao hàng. Nâng cấp mua giữa chừng sẽ kích hoạt từ đơn kế tiếp.
  - Khi hoàn thành đơn trong lúc popup đang mở, kết quả sẽ đợi người chơi đóng popup rồi mới tính toán để tránh xung đột giao diện.
- **Đơn giản hóa cơ chế giao hàng (Bỏ minigame thủ công)**:
  - Loại bỏ hoàn toàn 3 minigame (bắt hàng, né chướng ngại vật, tìm đường). Nhận đơn sẽ kích hoạt trực tiếp thanh tiến độ và thời gian đếm ngược (gần ~6s, vừa ~10s, xa ~15s; tốc độ lái chậm/nhanh tác động đến thời gian và rủi ro).
  - Mỗi thời điểm chỉ giao 1 đơn hàng để giữ nhịp độ thực tế; bổ sung loại "ĐƠN GHÉP" (trả x1,75 thù lao, thời gian giao x1,6, tiêu tốn thể lực và xăng x1,5).
  - Cân bằng lại toàn diện kinh tế trong game: tiền công cơ bản điều chỉnh hệ số x0,55; mốc thưởng cuối tháng nâng lên 240 / 360 / 480 đơn.
- **Đời sống & Mô phỏng xã hội (Life-Sim)**:
  - Bổ sung mua vé số trong mục ĐỜI SỐNG (tối đa 40 tờ/ngày), kết quả mở thưởng vào cuối ngày.
  - Thị trường đầu tư vàng và cổ phiếu biến động giá hàng ngày, bảng tổng kết cuối ngày thể hiện rõ lợi nhuận/thua lỗ trong ngày cũng như so với giá vốn ban đầu.
  - Cốt truyện 4 chương theo các mốc tháng (tháng 1, 7, 13, 19) cùng sự kiện gia đình định kỳ các tháng 3, 9, 15, 21 (sửa mái nhà dột, học phí cho em, mẹ ốm nhập viện, góp vốn kinh doanh).
  - Hệ thống vay nợ: vay bạn bè không lãi, vay nóng lãi 15%/tháng, vay ứng dụng lãi 25%/tháng; nợ vượt quá 30 triệu VND sẽ bị siết nợ (thua cuộc). Điều kiện thắng bắt buộc phải thanh toán sạch toàn bộ nợ.
  - Cơ chế thói quen (rượu bia, cờ bạc) với các tác động phụ khi sa đà và lựa chọn "tự nhủ bớt lại" mỗi tháng một lần.
  - Nhiều kịch bản kết thúc (Endings) dựa trên sức khỏe, gắn kết gia đình và thói quen tích lũy qua 24 tháng.
- **Tối ưu hiển thị & Trải nghiệm người dùng (UX)**:
  - Màn hình khởi đầu thiết kế responsive tự co giãn vừa khít trên mọi kích thước màn hình (PC màn hình thấp, điện thoại xoay ngang, màn hình thu phóng lớn) mà không bị che khuất nút thao tác.
  - Menu tạm dừng bổ sung nút "VỀ MÀN HÌNH BẮT ĐẦU" có hộp thoại xác nhận.
  - Nút "KẾT THÚC NGÀY" luôn yêu cầu xác nhận trước khi chốt ngày để tránh bấm nhầm.
  - Hỗ trợ đa ngôn ngữ Tiếng Việt và Tiếng Anh với nút chuyển đổi nhanh (VI/EN).
  - Chuyển toàn bộ font chữ sang Nunito (hỗ trợ hiển thị tiếng Việt hoàn chỉnh, sắc nét và hiện đại).
  - Tách biệt công tắc bật/tắt và thanh trượt âm lượng riêng cho Nhạc nền và Hiệu ứng âm thanh (sử dụng WebAudio tổng hợp, không phát sinh dung lượng tải).

### Lối chơi cốt lõi (Core Gameplay)
- **Mục tiêu**: Tích lũy tối thiểu 100 triệu VND tiền tiết kiệm trong vòng 24 tháng trong game và thanh toán đầy đủ sinh hoạt phí cố định 6,5 triệu VND mỗi tháng.
- **Vòng lặp ngày**: Mỗi ngày kéo dài 300 giây thực (từ 06:00 đến 22:00 trong game) với các khung giờ cao điểm trưa (11:00-13:00) và chiều tối (17:00-19:00).
- **Hệ thống Nâng cấp & Cột mốc**: Mở khóa nâng cấp độc quyền (động cơ tiết kiệm/tăng tốc, túi giữ nhiệt/thùng hàng lớn), các cột mốc tiền thưởng khi chạm 25 / 50 / 75 triệu VND tiết kiệm. Bảng tổng kết tài chính minh bạch "Tiền đi đâu?" hiển thị cuối ván chơi.

### Nền tảng kỹ thuật
- Chạy trực tiếp trên trình duyệt bằng HTML5, CSS3 và Vanilla JavaScript đóng gói thành một file duy nhất qua `build.py`.
- Tích hợp Service Worker cho phép cài đặt Web App (PWA) và chơi ngoại tuyến không cần mạng.
- Sử dụng đồng hồ game thống nhất (`src/loop.js`), tạm dừng game đóng băng toàn bộ tác vụ.
- Bộ kiểm thử tự động toàn diện bằng Playwright trong thư mục `tests/`.

---

## English

### Recent Changes
- **Service Worker & Update Delivery Optimization**: The main page now uses a network-first strategy (revalidating for new versions) and only falls back to cached content when offline or on a slow network connection (after 3 seconds). Service worker installation bypasses the HTTP cache to guarantee users receive updates immediately. Added the version identifier string in the Sound settings modal.
- **Blackjack Bug Fixes & Refinements**:
  - Allowed changing chip denominations (50K - 2M) flexibly between hands instead of locking the bet after the initial round.
  - Fixed an issue where the "NEW HAND" button became locked after a loss because the bet exceeded the 20% cash limit while retaining the old stake; the bet now automatically steps down to the largest valid chip.
  - Clarified button action labels ("SPLIT PAIR", "HIT"), dynamically hiding Double and Split buttons when conditions are not met.
- **Blackjack Casino in LIFE Hub**:
  - Available right from the start of the run inside the LIFE hub.
  - Standard Blackjack rules: freshly shuffled 52-card deck each hand, dealer stands on soft/hard 17, Blackjack pays 3:2, supports Hit, Stand, Double Down, and Split.
  - Capped at 5 hands per game day; each hand takes 10 seconds of day time and increases the gambling habit meter (+2). Outcomes are entirely fair and random.
  - Interactive choice after 3 consecutive losses ("walk away or chase losses"). Chasing and losing further damages Family rating (-3 per loss); running out of cash reveals a quick emergency loan option. Bets are committed immediately upon dealing (reloading the page will not refund bets). Tested via `tests/test_blackjack.py`.
- **Visual & Atmospheric Details**:
  - Dynamic street scene on the main dashboard: sun and moon track real game time across dawn, daytime, dusk, and night; animated rain effects during rainy weather; street scenery scrolls exclusively while actively delivering an order.
  - Active delivery cards feature an animated bike progress road tracking distance towards the destination flag alongside a progress bar and countdown timer.
  - Pulsing highlight borders for rush orders and newly received customer reviews (~3 seconds). The driver profile displays the 10 most recent reviews.
- **Non-blocking Delivery Navigation**:
  - Drivers can browse Upgrades, the Life Hub, and Driver Profile while an order is in transit. Upgrades purchased mid-delivery apply starting from the next order.
  - Deliveries completing while a modal is open wait until the modal is closed before finalizing payout and events to avoid UI conflicts.
- **Delivery Flow Streamlining (Minigames Removed)**:
  - Fully removed the 3 manual mini-games (catch, dodge, route rush). Selecting an offer now directly runs an integrated delivery countdown and progress track (near ~6s, mid ~10s, far ~15s; riding style adjusts speed and hazard rates).
  - Limited to one active delivery at a time; introduced COMBO ORDERS (pays 1.75x, takes 1.6x longer, costs 1.5x stamina and fuel).
  - Rebalanced game economy: base delivery payouts adjusted by a 0.55x multiplier; monthly bonus tiers raised to 240 / 360 / 480 deliveries.
- **Expanded Life Simulation (Life-Sim)**:
  - Added daily lottery ticket purchases in the LIFE hub (up to 40 tickets/day), drawn every evening.
  - Daily price fluctuations for gold and stock investments; end-of-day summary breaks down daily returns as well as total profit/loss against cost basis.
  - 4-chapter narrative progression (months 1, 7, 13, 19) with monthly family story dilemmas at months 3, 9, 15, 21 (leaking roof, sibling tuition, mother's hospital bills, friend's business partnership).
  - Loan and debt mechanics: interest-free friend loan, hot loan at 15%/month, app loan at 25%/month; exceeding 30 million VND in debt results in bankruptcy and seizure (game over). Debt must be completely cleared to win.
  - Habit tracking for drinking and gambling with craving/fatigue penalties, alongside a monthly "cut back" self-restraint action.
  - Diverse run endings depending on final health, family trust, and habits after 24 months.
- **UX & Responsive Layout Enhancements**:
  - Start screen adapted to fit within viewports of any aspect ratio (compact desktop heights, landscape phones, high-DPI scaling) without overflowing action buttons.
  - Added "BACK TO TITLE" button inside the pause menu with double confirmation.
  - "END DAY" button consistently requires a confirmation dialog before finalizing the day.
  - Full bilingual localization (Vietnamese and English) with an instant language toggle (VI/EN).
  - Typography migrated to Nunito font for comprehensive Vietnamese character support and clean legibility.
  - Independent toggles and volume sliders for background music and synthesized WebAudio sound effects.

### Core Gameplay
- **Objective**: Save at least 100 million VND within 24 in-game months while meeting recurring monthly living expenses of 6.5 million VND.
- **Daily Loop**: Each in-game day represents 300 real seconds (06:00 to 22:00 in-game) with peak rush hours at lunch (11:00-13:00) and evening (17:00-19:00).
- **Upgrades & Milestones**: Trade-off upgrades (eco vs. turbo engine, insulated bag vs. cargo box), savings milestones at 25M, 50M, and 75M VND, and transparent "Where Did It Go?" financial post-mortem breakdown upon game completion.

### Technical Architecture
- Pure client-side application built with HTML5, CSS3, and Vanilla JavaScript, bundled into a single distributable via `build.py`.
- Service Worker integration for offline caching and Progressive Web App (PWA) installation.
- Central game loop (`src/loop.js`) synchronizing clocks, deliveries, and pause states.
- Automated end-to-end regression test suite powered by Playwright in `tests/`.
