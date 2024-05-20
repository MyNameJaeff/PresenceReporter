import React, { useState } from "react";

import StudentRegister from "./StudentRegister";
import RegisterClass from "./RegisterClass";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

export interface StudentRegisterProps {
	className: string;
	classCode: string;
}

export default function AdminPage() {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [classList, setClassList] = useState<StudentRegisterProps[]>([]);

	//* Check if the user is authenticated when the component mounts
	React.useEffect(() => {
		const handleAuth = () => {
			if (localStorage.getItem("adminLoggedIn") === "true") {
				setIsAuthenticated(true);
			}
		};

		handleAuth();
	}, []);

	//* Confirm dialog box
	const confirm = (message: string) => {
		return window.confirm(message);
	};

	//* Logout function
	const logout = () => {
		if (confirm("Are you sure you want to logout?")) {
			localStorage.clear();
			setIsAuthenticated(false);
		}
	};

	return (
		<>
			{isAuthenticated ? (
				<div className="h-screen w-screen">
					<button
						type="button"
						onClick={() => logout()}
						className="bg-red-800 py-2 m-6 w-20 rounded-lg absolute hover:bg-red-600"
					>
						Logout
					</button>
					<div className="p-10 h-full w-full flex flex-row justify-around items-center font-mono">
						<StudentRegister
							classList={classList}
							setClassList={setClassList}
						/>
						<RegisterClass classList={classList} />
						<button
							type="button"
							onClick={() => navigate("/admin/reports")}
							className="bg-blue-800 py-3 bottom-0 mb-10 w-28 rounded-lg absolute hover:bg-blue-600"
						>
							Rapports
						</button>
					</div>
				</div>
			) : (
				<Login
					setIsAuthenticated={setIsAuthenticated}
					passcode={["admin"]}
					storageKey="adminLoggedIn"
				/>
			)}
		</>
	);
}
