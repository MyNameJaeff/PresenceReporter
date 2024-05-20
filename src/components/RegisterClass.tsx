import { getDatabase, set, ref, get } from "firebase/database";
import React from "react";
import type { StudentRegisterProps } from "./AdminPage";

export default function RegisterClass({ classList }: { classList: StudentRegisterProps[] }) {
	const [hasSubmitted, setHasSubmitted] = React.useState<boolean>(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		//* Prevent the page from refreshing
		event.preventDefault();

		//* Get the values from the form
		const className = event.currentTarget.classes.value;
		const classCode = event.currentTarget.classCode.value;

		//* Check if the input is empty
		if (classCode === "" || className === "") {
			alert("You have to input something!");
			return;
		}

		//* Checks if the class code already exists
		if (classList[classCode]) {
			alert("Class code already exists!");
			return;
		}

		//* Reset the form if the input is not empty and the class code does not exist
		event.currentTarget.reset();


		//* Add the class to the database
		const db = getDatabase();
		const dbRef = ref(db, `classRegister/${classCode}`);
		const data = { className: className, classCode: classCode, students: [""]};

		//* Check if the class code already exists
		await get(dbRef)
			.then((snapshot) => {
				if (snapshot.exists()) {
					alert("Class code already exists!");
					return;
				}
			})
			.catch((error) => {
				console.error(error);
			});

		await set(dbRef, data)
			.then(() => {
				setHasSubmitted(true);
				console.log("Data saved successfully!");
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<div className="w-1/6 h-2/6 p-5">
			<h1 className="text-xl border-b-2 border-white pl-2">Register Classes</h1>
			<form
				onSubmit={handleSubmit}
				className="h-full flex flex-col justify-around p-2"
			>
				<div className="">
					<label htmlFor="classes" className="text-lg">
						Class:
					</label>
					<br />
					<input
						type="text"
						id="classes"
						name="classes"
						className="w-full p-1 bg-gray-700"
					/>
				</div>
				<div>
					<label htmlFor="classCode" className="text-lg absolute">
						Class Code:
					</label>
					<br />
					<input
						type="text"
						id="classCode"
						name="classCode"
						className="w-full p-1 bg-gray-700"
					/>
				</div>
				<input
					type="submit"
					value={"Register"}
					className="bg-gray-700 px-2 py-2 rounded-xl hover:bg-gray-600 transition duration-200 ease-in-out border-2 border-gray-500 hover:border-gray-400 text-white font-bold cursor-pointer"
				/>
			</form>
			<p className="text-sm text-white mt-4 w-5/6 px-4">
				{hasSubmitted ? "Class registered successfully! Refresh to see in dropdown" : ""}
			</p>
		</div>
	);
}
