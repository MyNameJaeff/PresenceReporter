import React from "react";

export default function Login({
	setIsAuthenticated,
	passcode,
	storageKey,
}: {
	setIsAuthenticated: (data: boolean) => void;
	passcode: string[];
	storageKey: string;
}) {
	const [codeInput, setCodeInput] = React.useState<string>("");

	const checkLogin = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const password = event.currentTarget.password.value;
		let tempBool = false;

		passcode.map((pass) => {
			if (password === pass) {
				localStorage.setItem(storageKey, "true");
				localStorage.setItem("loggedIn", "true");
				if (storageKey !== "adminLoggedIn") {
					localStorage.setItem("classCode", password);
				}
				setIsAuthenticated(true);
				tempBool = true;
			}
		});
		if (!tempBool) {
			setCodeInput("");
			alert("Wrong password!");
		}
	};
	return (
		<div className="h-screen w-screen flex flex-row justify-around items-center font-mono">
			<form
				onSubmit={checkLogin}
				className="flex flex-col justify-start items-center"
			>
				<label htmlFor="password" className="border-b-2 border-blue-100 w-full">
					Password:
				</label>
				<input
					type="password"
					id="password"
					name="password"
					autoComplete="off"
					className="my-4 border-2 border-gray-400 w-48"
					onChange={(e) => setCodeInput(e.target.value)}
					value={codeInput}
				/>
				<input
					type="submit"
					value={"Send"}
					className="bg-gray-600 py-2 rounded-lg w-1/2"
				/>
			</form>
		</div>
	);
}
