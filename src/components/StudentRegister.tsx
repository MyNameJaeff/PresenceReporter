import React from "react";
import { useState } from "react";
import { getDatabase, ref, set, get } from "firebase/database";
import type { StudentRegisterProps } from "./AdminPage";

export default function StudentRegister({
	setClassList,
	classList,
}: {
	setClassList: (data: never[]) => void;
	classList: StudentRegisterProps[];
}) {
	const [studentList, setStudentList] = useState<string[]>([]);
	const [textPlaceholder, setTextPlaceholder] = useState<string>(
		"Register students...",
	);
	const [optionalCheckbox, setOptionalCheckbox] = useState<boolean>(false);

	const handleInputChange = (event: React.ChangeEvent<HTMLDivElement>) => {
		const innerText = event.target.innerText;
		const textArray = innerText.split("\n");
		setStudentList(textArray);
	};

	const handleAddStudent = (classCode: string, optionalCheckbox: boolean) => {
		//* Check if the input is empty
		if (studentList.length === 0 || studentList[0] === "") {
			alert("You have to input something!");
			return;
		}

		//* Remove empty strings
		const students = studentList.filter((student) => student !== "");
		const dataStucture: {
			className: string;
			classCode: string;
			students: string[];
		} = { className: "", classCode: "", students: [] };

		//* Add students to the database
		const db = getDatabase();
		const dbRef = ref(db, `classRegister/${classCode}`);
		get(dbRef).then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				//* Removes the empty string from the array
				data.students = data.students.filter(
					(student: string) => student !== "",
				);
				dataStucture.className = data.className;
				dataStucture.classCode = data.classCode;

				if (!optionalCheckbox) {
					dataStucture.students = students;
				} else {
					dataStucture.students = [...data.students, ...students];
				}
				set(dbRef, dataStucture)
					.then(() => {
						console.log("Data saved successfully!");
					})
					.catch((error) => {
						console.error(error);
					});
			}
		});
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const className = event.currentTarget.classes.value;
		const optionalCheckbox = event.currentTarget.optionalCheckbox.checked;
		handleAddStudent(className, optionalCheckbox);

		// Clear the form
		event.currentTarget.reset();
		setStudentList([]);
		const studentList = document.getElementById(
			"studentList",
		) as HTMLDivElement;
		studentList.innerText = "";
		setTextPlaceholder("Students Registered");
	};

	React.useEffect(() => {
		const db = getDatabase();
		const dbRef = ref(db, "classRegister");
		get(dbRef).then((snapshot) => {
			if (snapshot.exists()) {
				const data: never[] = snapshot.val(); // Specify the type of 'data' as 'never[]'
				setClassList(data);
			}
		});
	}, [setClassList]);

	return (
		<div className=" w-2/6 h-5/6 p-5 flex flex-col justify-around pb-10">
			<h1 className="text-2xl border-b-2 border-white pl-2">
				Register students
			</h1>
			<form onSubmit={handleSubmit} className="h-5/6">
				<div className="pb-2">
					<label htmlFor="classes" className="text-lg">
						Class:
					</label>
					<select
						id="classes"
						name="classes"
						className="p-1 ml-2 rounded bg-gray-700"
					>
						{Object.entries(classList).length > 0 ? (
							Object.entries(classList).map(
								([key, value]: [string, unknown]) => (
									<option
										key={key}
										value={(value as StudentRegisterProps).classCode}
									>
										{(value as StudentRegisterProps).className}
									</option>
								),
							)
						) : (
							<option>No classes registered</option>
						)}
					</select>
				</div>
				<p className="text-lg absolute ml-2 mt-2 text-white text-opacity-80 pointer-events-none">
					{textPlaceholder}
				</p>
				<div
					onFocus={() => setTextPlaceholder("")}
					contentEditable
					onInput={handleInputChange}
					spellCheck="false"
					autoCorrect="off"
					className="overflow-scroll border border-solid border-gray-500 p-2 rounded-lg text-start h-5/6"
					id="studentList"
				/>
				<div className="w-full flex justify-center h-1/6 items-center mt-4">
					<input
						type="submit"
						value={"Register"}
						className="bg-gray-700 px-8 py-4 rounded-xl hover:bg-gray-600 transition duration-200 ease-in-out border-2 border-gray-500 hover:border-gray-400 text-white font-bold cursor-pointer"
					/>
					<div className="px-5">
						<div className="flex border-b-2 border-white">
							<label htmlFor="optionalCheckbox" className="text-lg grow">
								Add
							</label>
							<input
								type="checkbox"
								className="ml-6"
								name="optionalCheckbox"
								onChange={() => setOptionalCheckbox(!optionalCheckbox)}
								checked={optionalCheckbox === false}
							/>
						</div>
						<div className="flex">
							<label htmlFor="optionalCheckbox2" className="text-lg grow">
								Overwrite
							</label>
							<input
								type="checkbox"
								className="ml-6"
								name="optionalCheckbox2"
								onChange={() => setOptionalCheckbox(!optionalCheckbox)}
								checked={optionalCheckbox}
							/>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
