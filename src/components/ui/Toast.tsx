import { toast as sonnerToast, type Toaster } from "sonner";

function success(message: string) {
  sonnerToast.success(message);
}

function error(message: string) {
  sonnerToast.error(message);
}

function info(message: string) {
  sonnerToast.info(message);
}

function warning(message: string) {
  sonnerToast.warning(message);
}

export const toast = { success, error, info, warning };
export { Toaster };
