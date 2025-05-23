
let adminEndPoints = [
    "/admin/create", "/admin/list", "/admin/get", "/admin/update", "/admin/remove",
    "/admin/image", "/admin/password", "/admin/role"
]


let roleEndPoints = [
    "/admin/roles/create", "/admin/roles/list", "/admin/roles/get", "/admin/roles/update", "/admin/roles/remove"
]


let permissionEndPoints = ["/admin/permissions/list"]


let customerEndPoints = [
    "/admin/customers/list", "/admin/customers/get", "/admin/customers/update", "/admin/customers/updateIsActive", "/admin/customers/remove",
    "/admin/customers/image", "/admin/customers/password"
]


let sellerEndPoints = [
    "/admin/sellers/list", "/admin/sellers/get", "/admin/sellers/create", "/admin/sellers/update", "/admin/sellers/updateIsActive", "/admin/sellers/remove",
    "/admin/sellers/image", "/admin/sellers/password", "/admin/sellers/identity"
]


let shopEndPoints = [
    "/admin/shops/create", "/admin/shops/list", "/admin/shops/count", "/admin/shops/get", "/admin/shops/update", "/admin/shops/updateIsActive", "/admin/shops/remove",
    "/admin/shops/image", "/admin/shops/cover", "/admin/shops/banner"
]


let categoryEndPoints = [
    "/admin/categories/create", "/admin/categories/update", "/admin/categories/remove",
    "/admin/categories/list", "/admin/categories/get", "/admin/categories/image"
]


let tagEndPoints = [
    "/admin/tags/create", "/admin/tags/update", "/admin/tags/remove",
    "/admin/tags/list", "/admin/tags/get"
]


let fieldEndPoints = [
    "/admin/fields/create", "/admin/fields/update", "/admin/fields/remove",
    "/admin/fields/list", "/admin/fields/get"
]


let formEndPoints = [
    "/admin/forms/create", "/admin/forms/update", "/admin/forms/remove",
    "/admin/forms/list", "/admin/forms/get"
]


let productEndPoints = [
    "/admin/products/create", "/admin/products/update", "/admin/products/updateIsActive", "/admin/products/remove",
    "/admin/products/list", "/admin/products/count", "/admin/products/get", "/admin/products/export"
]


let variationEndPoints = [
    "/admin/variations/create", "/admin/variations/update", "/admin/variations/remove",
    "/admin/variations/list", "/admin/variations/get", "/admin/variations/image", "/admin/variations/listByPrice"
]


let serviceEndPoints = [
    "/admin/services/create", "/admin/services/update", "/admin/services/updateIsActive", "/admin/services/remove",
    "/admin/services/list", "/admin/services/count", "/admin/services/get", "/admin/services/image"
]


let bannerEndPoints = [
    "/admin/banners/create", "/admin/banners/update", "/admin/banners/remove",
    "/admin/banners/list", "/admin/banners/get", "/admin/banners/image"
]


let wishlistEndPoints = [
    "/admin/wishlists/get", "/admin/wishlists/list", "/admin/wishlists/update",
    "/admin/wishlists/remove"
]


let cartEndPoints = [
    "/admin/carts/get", "/admin/carts/list", "/admin/carts/update",
    "/admin/carts/remove"
]


let basketEndPoints = [
    "/admin/baskets/get", "/admin/baskets/list", "/admin/baskets/update",
    "/admin/baskets/remove"
]


let orderEndPoints = [
    "/admin/orders/get", "/admin/orders/list", "/admin/orders/update", "/admin/orders/status",
]


let requestEndPoints = [
    "/admin/requests/get", "/admin/requests/list", "/admin/requests/update",
]


let reviewEndPoints = [
    "/admin/reviews/get", "/admin/reviews/list", "/admin/reviews/remove",
]


let couponEndPoints = [
    "/admin/coupons/create", "/admin/coupons/update", "/admin/coupons/get",
    "/admin/coupons/list", "/admin/coupons/remove",
]


let roomEndPoints = [
    "/admin/rooms/update", "/admin/rooms/get",
    "/admin/rooms/list", "/admin/rooms/remove", "/admin/rooms/file"
]


let notificationEndPoints = [
    "/admin/notifications/create", "/admin/notifications/update", "/admin/notifications/get",
    "/admin/notifications/list", "/admin/notifications/remove",
]


let settingEndPoints = [
    "/admin/settings/update",
    "/admin/settings/list",
    "/admin/settings/tiers",
]


let dashboardEndPoints = [
    "/admin/dashboards/customer",
    "/admin/dashboards/seller",
    "/admin/dashboards/shop",
    "/admin/dashboards/item",
    "/admin/dashboards/revenue",
    "/admin/dashboards/ordersByDay",
    "/admin/dashboards/ordersByMonth",
    "/admin/dashboards/requestsByDay",
    "/admin/dashboards/requestsByMonth",
]


let reportEndPoints = [
    "/admin/reports/countCustomers",
    "/admin/reports/countSellers",
    "/admin/reports/countShops",
    "/admin/reports/countTiers",
    "/admin/reports/countProducts",
    "/admin/reports/countServices",
    "/admin/reports/shippingInvoice",
    "/admin/reports/sellersInvoices",
    "/admin/reports/listSellersWithOrderSummary",
    "/admin/reports/listSellersWithServicesRequestSummary",
]


let complaintEndPoints = [
    "/admin/complaints/list",
    "/admin/complaints/get",
    "/admin/complaints/update",
    "/admin/complaints/remove"
]

let cityEndPoints = [
    "/admin/cities/create", "/admin/cities/remove",
    "/admin/cities/list", "/admin/cities/get", 
    "/admin/cities/addFirstFlightCity", "/admin/cities/removeFirstFlightCity",
    "/admin/cities/addIfastCity", "/admin/cities/removeIfastCity"
]

let alertEndPoints = [
    "/admin/alerts/list", "/admin/alerts/remove"
]


adminEndPoints = new Set(adminEndPoints);
roleEndPoints = new Set(roleEndPoints);
permissionEndPoints = new Set(permissionEndPoints);
customerEndPoints = new Set(customerEndPoints);
sellerEndPoints = new Set(sellerEndPoints);
shopEndPoints = new Set(shopEndPoints);
categoryEndPoints = new Set(categoryEndPoints);
tagEndPoints = new Set(tagEndPoints);
fieldEndPoints = new Set(fieldEndPoints);
formEndPoints = new Set(formEndPoints);
productEndPoints = new Set(productEndPoints);
variationEndPoints = new Set(variationEndPoints);
serviceEndPoints = new Set(serviceEndPoints);
bannerEndPoints = new Set(bannerEndPoints);
wishlistEndPoints = new Set(wishlistEndPoints);
cartEndPoints = new Set(cartEndPoints);
basketEndPoints = new Set(basketEndPoints);
orderEndPoints = new Set(orderEndPoints);
requestEndPoints = new Set(requestEndPoints);
reviewEndPoints = new Set(reviewEndPoints);
couponEndPoints = new Set(couponEndPoints);
roomEndPoints = new Set(roomEndPoints);
notificationEndPoints = new Set(notificationEndPoints);
settingEndPoints = new Set(settingEndPoints);
dashboardEndPoints = new Set(dashboardEndPoints);
reportEndPoints = new Set(reportEndPoints);
complaintEndPoints = new Set(complaintEndPoints);
cityEndPoints = new Set(cityEndPoints);
alertEndPoints = new Set(alertEndPoints);

let permissions = new Map();

permissions.set("admins", adminEndPoints)
permissions.set("roles", roleEndPoints)
permissions.set("permissions", permissionEndPoints)
permissions.set("customers", customerEndPoints)
permissions.set("sellers", sellerEndPoints)
permissions.set("shops", shopEndPoints)
permissions.set("categories", categoryEndPoints)
permissions.set("tags", tagEndPoints)
permissions.set("fields", fieldEndPoints)
permissions.set("forms", formEndPoints)
permissions.set("products", productEndPoints)
permissions.set("variations", variationEndPoints)
permissions.set("services", serviceEndPoints)
permissions.set("banners", bannerEndPoints)
permissions.set("wishlists", wishlistEndPoints)
permissions.set("carts", cartEndPoints)
permissions.set("baskets", basketEndPoints)
permissions.set("orders", orderEndPoints)
permissions.set("requests", requestEndPoints)
permissions.set("reviews", reviewEndPoints)
permissions.set("coupons", couponEndPoints)
permissions.set("rooms", roomEndPoints)
permissions.set("notifications", notificationEndPoints)
permissions.set("settings", settingEndPoints)
permissions.set("dashboards", dashboardEndPoints)
permissions.set("reports", reportEndPoints)
permissions.set("complaints", complaintEndPoints)
permissions.set("cities", cityEndPoints)
permissions.set("alerts", alertEndPoints)

module.exports = { permissions }