import React from "react";
const toastr = window.toastr;

const toastNumber = Math.random()
  .toString()
  .split(".")[1];

class Toast extends React.Component {
  show({ message = "Grade updated successfuly!" } = {}) {
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
      onclick: null,
      showDuration: "3000",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut"
    };

    toastr.success(message, "Edit grade");
  }
}

export default Toast;
