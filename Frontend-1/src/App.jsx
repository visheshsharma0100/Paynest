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
        <Route path="/signin"    element={<PayNestSignIn />} />
        <Route path="/signup"    element={<PayNestSignUp />} />
        <Route path="/dashboard" element={<PayNestDashboard />} />
        <Route path="/send"      element={<PayNestSend />} />
      </Routes>
    </BrowserRouter>
  );
}