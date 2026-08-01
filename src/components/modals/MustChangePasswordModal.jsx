import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MustChangePasswordModal = () => {
  const { mustChangePassword, setMustChangePassword } = useAuth();
  const navigate = useNavigate();

  if (!mustChangePassword) return null;

  const handleContinue = () => {
    setMustChangePassword(false);
    navigate("/profile"); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-[400px]">
        <h2 className="text-lg font-semibold">Password Update Required</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your account was created by an administrator.
          For security reasons, please update your password.
        </p>
        <button
          onClick={handleContinue}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MustChangePasswordModal;
