import React from "react";
const toastr = window.toastr;

const toastNumber = Math.random()
  .toString()
  .split(".")[1];

class Toast extends React.Component {
  show({ message = "An error occured", header = "error" } = {}) {
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: "toast-bottom-right",
      preventDuplicates: false,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut"
    };

    toastr.error(message, header);
  }
}

export default Toast;
