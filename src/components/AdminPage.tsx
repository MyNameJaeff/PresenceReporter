import React, { useState } from "react";

import StudentRegister from "./StudentRegister";
import RegisterClass from "./RegisterClass";

export default function AdminPage() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	const checkLogin = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const password = event.currentTarget.password.value;

		if (password === "admin") {
			localStorage.setItem("authenticated", "true");
			setIsAuthenticated(true);
		} else {
			alert("Wrong password!");
		}
	};

	React.useEffect(() => {
		const handleAuth = () => {
			//* Check if the user is authenticated
			if (localStorage.getItem("authenticated") === "true") {
				setIsAuthenticated(true);
			}
		};

		handleAuth();
	}, []);

	return (
		<>
			{isAuthenticated ? (
				<div className="p-10 h-screen w-screen flex flex-row justify-around items-center font-mono">
					<StudentRegister />
					<RegisterClass />
				</div>
			) : (
				<form onSubmit={checkLogin}>
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						name="password"
						autoComplete="off"
					/>
					<input type="submit" />
				</form>
			)}
		</>
	);
}
