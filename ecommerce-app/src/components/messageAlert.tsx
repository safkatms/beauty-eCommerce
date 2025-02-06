// components/MessageAlert.tsx

import { CheckCircle, XCircle } from "lucide-react";

interface MessageAlertProps {
  message: string;
  type: "success" | "error" | null;
  onClose: () => void;
}

const MessageAlert = ({ message, type, onClose }: MessageAlertProps) => {
  if (type === null) return null; // Do not render if there is no type

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 w-full max-w-md rounded-md text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } flex items-center justify-between transition duration-500 ease-in-out`}
    >
      <div className="flex items-center">
        {type === "success" ? (
          <CheckCircle className="mr-2" size={20} />
        ) : (
          <XCircle className="mr-2" size={20} />
        )}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-white">
        &times;
      </button>
    </div>
  );
};

export default MessageAlert;
