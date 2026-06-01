import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PayNestSignIn   from "./signin";
import PayNestSignUp   from "./signup";
import PayNestDashboard from "./Dashboard";
import PayNestSend     from "./send";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/signup" />} />
       <Route path="/signin"    element={<Navigate to="/signin" />} />
        <Route path="/signup"    element={<Navigate to="/signup" />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard" />} />
        <Route path="/send"      element={<Navigate to="/send" />} />
      </Routes>
    </BrowserRouter>
  );
}
