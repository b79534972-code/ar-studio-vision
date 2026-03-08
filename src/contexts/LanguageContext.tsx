import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    "nav.overview": "Overview",
    "nav.models": "My Furniture",
    "nav.rooms": "My Rooms",
    "nav.layouts": "Saved Layouts",
    "nav.profile": "Profile",
    "nav.billing": "Billing",
    "nav.settings": "Settings",
    "nav.editor": "Room Editor",
    "nav.furniture": "Furniture Library",
    "nav.aiGenerator": "AI Generator",

    // Topbar
    "topbar.dashboard": "Dashboard",
    "topbar.uploadModel": "Upload Model",
    "topbar.createRoom": "Create Room",

    // Profile dropdown
    "profile.logout": "Log Out",

    // Dashboard Overview
    "overview.title": "Your AR Workspace",
    "overview.subtitle": "Design, visualize, and optimize interior spaces",
    "overview.createLayout": "Create Layout",
    "overview.addFurniture": "Add Furniture",
    "overview.aiLayout": "AI Layout",
    "overview.stats.models": "Models",
    "overview.stats.rooms": "Rooms",
    "overview.stats.layouts": "Layouts",
    "overview.stats.ai": "AI Suggestions",
    "overview.quickActions": "Quick Actions",
    "overview.recentActivity": "Recent Activity",
    "overview.viewAll": "View all activity",
    "overview.launchAR": "Launch AR Session",
    "overview.launchAR.desc": "Place furniture in your real room",
    "overview.aiOptimizer": "AI Space Optimizer",
    "overview.aiOptimizer.desc": "Automatically optimize room layout",
    "overview.upgradePlan": "Upgrade Plan",
    "overview.upgradePlan.desc": "Unlock AI features and unlimited resources",
    "overview.used": "used",
    "overview.startAR": "Start AR Session",
    "overview.addFurniture.desc": "Upload images and generate 3D furniture",
    "overview.recentRooms": "Recent Rooms",
    "overview.items": "items",
    "overview.stats.models.desc": "Furniture objects in your library",
    "overview.stats.rooms.desc": "Active room projects",
    "overview.stats.layouts.desc": "Saved AR configurations",
    "overview.stats.ai.desc": "AI-powered suggestions used",

    // Workflow
    "workflow.title": "Your Design Workflow",
    "workflow.upload": "Upload Model",
    "workflow.createRoom": "Create Room",
    "workflow.arrange": "Arrange Layout",
    "workflow.viewAR": "View in AR",

    // Activity
    "activity.uploadedSofa": "Uploaded Modern Sofa model",
    "activity.createdLayout": "Created living room layout",
    "activity.arSession": "AR session completed",
    "activity.editedRoom": "Edited bedroom layout",
    "activity.2hAgo": "2 hours ago",
    "activity.5hAgo": "5 hours ago",
    "activity.yesterday": "Yesterday",
    "activity.2dAgo": "2 days ago",

    // Recent Rooms
    "rooms.recent.living": "Living Room",
    "rooms.recent.bedroom": "Master Bedroom",
    "rooms.recent.office": "Home Office",

    // My Models / Furniture
    "models.title": "My Furniture",
    "models.subtitle": "Upload images to generate 3D furniture objects",
    "models.add": "Add Furniture",
    "models.search": "Search furniture…",

    // My Rooms
    "rooms.title": "My Rooms",
    "rooms.subtitle": "Create and manage room spaces",
    "rooms.create": "Create Room",
    "rooms.search": "Search rooms…",
    "rooms.layouts": "layouts",

    // Saved Layouts
    "layouts.title": "Saved Layouts",
    "layouts.subtitle": "Your saved AR room configurations",
    "layouts.new": "New Layout",
    "layouts.search": "Search layouts…",
    "layouts.objects": "objects",

    // Profile
    "profile.title": "Profile",
    "profile.subtitle": "Manage your account and preferences",
    "profile.tab.account": "Account",
    "profile.tab.plan": "Plan & Usage",
    "profile.tab.billing": "Billing",
    "profile.tab.preferences": "Preferences",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.password": "Password",
    "profile.save": "Save Changes",
    "profile.deleteAccount": "Delete Account",
    "profile.paymentMethod": "Payment Method",
    "profile.noPayment": "No payment method on file",
    "profile.invoiceHistory": "Invoice History",
    "profile.noInvoices": "No invoices yet",
    "profile.currentPlan": "Current Plan",
    "profile.unlimited": "unlimited",
    "profile.defaultUnit": "Default Unit",
    "profile.unitDesc": "Measurement unit for dimensions",
    "profile.theme": "Theme",
    "profile.themeDesc": "Application color theme",
    "profile.autoSave": "Auto-save layouts",
    "profile.autoSaveDesc": "Automatically save layout changes",
    "profile.arGrid": "AR grid overlay",
    "profile.arGridDesc": "Show measurement grid in AR",
    "profile.aiSuggest": "AI auto-suggest",
    "profile.aiSuggestDesc": "Get AI suggestions while designing",
    "profile.language": "Language",
    "profile.languageDesc": "Choose your preferred language",

    // Billing
    "billing.title": "Billing",
    "billing.subtitle": "Manage your subscription and payments",
    "billing.upgrade": "Upgrade Plan",
    "billing.cancel": "Cancel Subscription",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Application and workspace settings",
    "settings.placeholder": "Settings will be available when Azure Cloud is connected.",

    // Add Furniture Modal
    "furniture.add": "Add Furniture",
    "furniture.details": "Object Details",
    "furniture.preview": "3D Preview",
    "furniture.upload.desc": "Upload a photo of any furniture piece. We'll use it to generate a 3D object for AR placement.",
    "furniture.upload.cta": "Click to upload or drag & drop",
    "furniture.upload.hint": "JPG, PNG, or WEBP • Max 10MB",
    "furniture.name": "Object Name",
    "furniture.category": "Category",
    "furniture.material": "Material",
    "furniture.dimensions": "Dimensions (cm)",
    "furniture.shape": "Base Shape",
    "furniture.generate": "Generate 3D Object",
    "furniture.generating": "Generating…",
    "furniture.back": "Back",
    "furniture.editDetails": "Edit Details",
    "furniture.save": "Save to Library",
    "furniture.saved": "Furniture saved!",
    "furniture.savedDesc": "has been added to your library.",
    "furniture.invalidFile": "Invalid file",
    "furniture.invalidFileDesc": "Please upload an image file (JPG, PNG, WEBP).",

    // Plan
    "plan.plan": "Plan",

    // Mobile nav
    "mobile.home": "Home",
    "mobile.models": "Models",
    "mobile.rooms": "Rooms",
    "mobile.profile": "Profile",
  },
  vi: {
    // Sidebar
    "nav.overview": "Tổng quan",
    "nav.models": "Nội thất",
    "nav.rooms": "Phòng",
    "nav.layouts": "Bố cục đã lưu",
    "nav.profile": "Hồ sơ",
    "nav.billing": "Thanh toán",
    "nav.settings": "Cài đặt",

    // Topbar
    "topbar.dashboard": "Bảng điều khiển",
    "topbar.uploadModel": "Tải mô hình",
    "topbar.createRoom": "Tạo phòng",

    // Profile dropdown
    "profile.logout": "Đăng xuất",

    // Dashboard Overview
    "overview.title": "Không gian AR của bạn",
    "overview.subtitle": "Thiết kế, trực quan hóa và tối ưu hóa không gian nội thất",
    "overview.createLayout": "Tạo bố cục",
    "overview.addFurniture": "Thêm nội thất",
    "overview.aiLayout": "Bố cục AI",
    "overview.stats.models": "Mô hình",
    "overview.stats.rooms": "Phòng",
    "overview.stats.layouts": "Bố cục",
    "overview.stats.ai": "Gợi ý AI",
    "overview.quickActions": "Thao tác nhanh",
    "overview.recentActivity": "Hoạt động gần đây",
    "overview.viewAll": "Xem tất cả hoạt động",
    "overview.launchAR": "Mở phiên AR",
    "overview.launchAR.desc": "Đặt nội thất vào phòng thực tế",
    "overview.aiOptimizer": "Tối ưu không gian AI",
    "overview.aiOptimizer.desc": "Tự động tối ưu bố cục phòng",
    "overview.upgradePlan": "Nâng cấp gói",
    "overview.upgradePlan.desc": "Mở khóa tính năng AI và tài nguyên không giới hạn",
    "overview.used": "đã dùng",
    "overview.startAR": "Mở phiên AR",
    "overview.addFurniture.desc": "Tải ảnh lên và tạo nội thất 3D",
    "overview.recentRooms": "Phòng gần đây",
    "overview.items": "đối tượng",
    "overview.stats.models.desc": "Đối tượng nội thất trong thư viện",
    "overview.stats.rooms.desc": "Dự án phòng đang hoạt động",
    "overview.stats.layouts.desc": "Cấu hình AR đã lưu",
    "overview.stats.ai.desc": "Gợi ý AI đã sử dụng",

    // Workflow
    "workflow.title": "Quy trình thiết kế",
    "workflow.upload": "Tải mô hình",
    "workflow.createRoom": "Tạo phòng",
    "workflow.arrange": "Sắp xếp bố cục",
    "workflow.viewAR": "Xem trong AR",

    // Activity
    "activity.uploadedSofa": "Đã tải lên mô hình Sofa hiện đại",
    "activity.createdLayout": "Đã tạo bố cục phòng khách",
    "activity.arSession": "Phiên AR đã hoàn thành",
    "activity.editedRoom": "Đã chỉnh sửa bố cục phòng ngủ",
    "activity.2hAgo": "2 giờ trước",
    "activity.5hAgo": "5 giờ trước",
    "activity.yesterday": "Hôm qua",
    "activity.2dAgo": "2 ngày trước",

    // Recent Rooms
    "rooms.recent.living": "Phòng khách",
    "rooms.recent.bedroom": "Phòng ngủ chính",
    "rooms.recent.office": "Phòng làm việc",

    // My Models / Furniture
    "models.title": "Nội thất của tôi",
    "models.subtitle": "Tải ảnh lên để tạo đối tượng 3D nội thất",
    "models.add": "Thêm nội thất",
    "models.search": "Tìm kiếm nội thất…",

    // My Rooms
    "rooms.title": "Phòng của tôi",
    "rooms.subtitle": "Tạo và quản lý không gian phòng",
    "rooms.create": "Tạo phòng",
    "rooms.search": "Tìm kiếm phòng…",
    "rooms.layouts": "bố cục",

    // Saved Layouts
    "layouts.title": "Bố cục đã lưu",
    "layouts.subtitle": "Cấu hình phòng AR đã lưu của bạn",
    "layouts.new": "Bố cục mới",
    "layouts.search": "Tìm kiếm bố cục…",
    "layouts.objects": "đối tượng",

    // Profile
    "profile.title": "Hồ sơ",
    "profile.subtitle": "Quản lý tài khoản và tùy chọn",
    "profile.tab.account": "Tài khoản",
    "profile.tab.plan": "Gói & Sử dụng",
    "profile.tab.billing": "Thanh toán",
    "profile.tab.preferences": "Tùy chọn",
    "profile.name": "Tên",
    "profile.email": "Email",
    "profile.password": "Mật khẩu",
    "profile.save": "Lưu thay đổi",
    "profile.deleteAccount": "Xóa tài khoản",
    "profile.paymentMethod": "Phương thức thanh toán",
    "profile.noPayment": "Chưa có phương thức thanh toán",
    "profile.invoiceHistory": "Lịch sử hóa đơn",
    "profile.noInvoices": "Chưa có hóa đơn",
    "profile.currentPlan": "Gói hiện tại",
    "profile.unlimited": "không giới hạn",
    "profile.defaultUnit": "Đơn vị mặc định",
    "profile.unitDesc": "Đơn vị đo lường cho kích thước",
    "profile.theme": "Giao diện",
    "profile.themeDesc": "Giao diện màu sắc ứng dụng",
    "profile.autoSave": "Tự động lưu bố cục",
    "profile.autoSaveDesc": "Tự động lưu thay đổi bố cục",
    "profile.arGrid": "Lưới AR",
    "profile.arGridDesc": "Hiển thị lưới đo trong AR",
    "profile.aiSuggest": "Gợi ý AI tự động",
    "profile.aiSuggestDesc": "Nhận gợi ý AI khi thiết kế",
    "profile.language": "Ngôn ngữ",
    "profile.languageDesc": "Chọn ngôn ngữ ưa thích của bạn",

    // Billing
    "billing.title": "Thanh toán",
    "billing.subtitle": "Quản lý đăng ký và thanh toán",
    "billing.upgrade": "Nâng cấp gói",
    "billing.cancel": "Hủy đăng ký",

    // Settings
    "settings.title": "Cài đặt",
    "settings.subtitle": "Cài đặt ứng dụng và không gian làm việc",
    "settings.placeholder": "Cài đặt sẽ khả dụng khi Azure Cloud được kết nối.",

    // Add Furniture Modal
    "furniture.add": "Thêm nội thất",
    "furniture.details": "Chi tiết đối tượng",
    "furniture.preview": "Xem trước 3D",
    "furniture.upload.desc": "Tải ảnh bất kỳ món nội thất. Chúng tôi sẽ tạo đối tượng 3D để đặt trong AR.",
    "furniture.upload.cta": "Nhấn để tải lên hoặc kéo & thả",
    "furniture.upload.hint": "JPG, PNG, hoặc WEBP • Tối đa 10MB",
    "furniture.name": "Tên đối tượng",
    "furniture.category": "Danh mục",
    "furniture.material": "Chất liệu",
    "furniture.dimensions": "Kích thước (cm)",
    "furniture.shape": "Hình dạng cơ bản",
    "furniture.generate": "Tạo đối tượng 3D",
    "furniture.generating": "Đang tạo…",
    "furniture.back": "Quay lại",
    "furniture.editDetails": "Sửa chi tiết",
    "furniture.save": "Lưu vào thư viện",
    "furniture.saved": "Đã lưu nội thất!",
    "furniture.savedDesc": "đã được thêm vào thư viện.",
    "furniture.invalidFile": "Tệp không hợp lệ",
    "furniture.invalidFileDesc": "Vui lòng tải lên tệp hình ảnh (JPG, PNG, WEBP).",

    // Plan
    "plan.plan": "Gói",

    // Mobile nav
    "mobile.home": "Trang chủ",
    "mobile.models": "Nội thất",
    "mobile.rooms": "Phòng",
    "mobile.profile": "Hồ sơ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved === "vi" ? "vi" : "en") as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[language][key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
