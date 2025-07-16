import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <ToastContainer position="top-right" autoClose={3000} />
  </>
);
