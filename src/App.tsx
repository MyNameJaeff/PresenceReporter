import "./App.css";
import { initializeApp } from "firebase/app";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";

import ReportPrecence from "./components/ReportPrecence";
import AdminPage from "./components/AdminPage";
import ReportsPage from "./components/ReportsPage";

function App() {
	const firebaseConfig = {
		apiKey: "AIzaSyCHsjKcumIRcnTywGgt7jiyQjskfVnqQ6g",
		authDomain: "presencereporter.firebaseapp.com",
		databaseURL:
			"https://presencereporter-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "presencereporter",
		storageBucket: "presencereporter.appspot.com",
		messagingSenderId: "94125417499",
		appId: "1:94125417499:web:fb8ccfaadf3f39f49204be",
	};

	initializeApp(firebaseConfig);

	const router = createBrowserRouter([
		{
			path: "/admin",
			element: <AdminPage />,
		},
		{
			path: "/",
			element: <ReportPrecence />,
		},
		{
			path: "/admin/reports",
			element: <ReportsPage />,
		},
	]);

	return (
		<div className="w-screen h-screen">
			<React.StrictMode>
				<RouterProvider router={router} />
			</React.StrictMode>
		</div>
	);
}

export default App;
