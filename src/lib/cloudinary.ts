import Swal from "sweetalert2";

const brandAlert = Swal.mixin({
  customClass: {
    popup: "np-swal-popup",
    title: "np-swal-title",
    htmlContainer: "np-swal-html",
    actions: "np-swal-actions",
    confirmButton: "np-swal-confirm",
    cancelButton: "np-swal-cancel",
    icon: "np-swal-icon",
  },
  buttonsStyling: false,
  background: "#0a1225",
  color: "#e6eeff",
  backdrop: "rgba(3, 8, 19, 0.72)",
  showClass: {
    popup: "swal2-show np-swal-in",
  },
  hideClass: {
    popup: "swal2-hide np-swal-out",
  },
});

export default brandAlert;

