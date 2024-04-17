import React from "react";
import { useState } from "react";
import { getDatabase, ref, set, get } from "firebase/database";

interface StudentRegisterProps {
	className: string;
	classCode: string;
}

export default function StudentRegister() {
	const [studentList, setStudentList] = useState<string[]>([]);
	const [classList, setClassList] = useState<StudentRegisterProps[]>([]);

	const handleInputChange = (event: React.ChangeEvent<HTMLDivElement>) => {
		const innerText = event.target.innerText;
		const textArray = innerText.split("\n");
		setStudentList(textArray);
	};

	const handleAddStudent = (className: string) => {
		console.log(className);
		//* Check if the input is empty
		if (studentList.length === 0 || studentList[0] === "") {
			alert("You have to input something!");
			return;
		}

		//* Remove empty strings
		const students = studentList.filter((student) => student !== "");
		console.log(students);

		//* Add students to the database
		const db = getDatabase();
		const classRef = ref(db, className);
		set(classRef, {
			students: students,
		});
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const className = event.currentTarget.classes.value;
		handleAddStudent(className);

		// Clear the form
		event.currentTarget.reset();
		setStudentList([]);
		const studentList = document.getElementById(
			"studentList",
		) as HTMLDivElement;
		studentList.innerText = "";
	};

	React.useEffect(() => {
		const db = getDatabase();
		const dbRef = ref(db, "classes");
		get(dbRef).then((snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.val();
				setClassList(data);
			}
		});
	}, []);

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
						{classList.map((selectedClass: StudentRegisterProps) => (
							<option
								key={selectedClass.className}
								value={selectedClass.className}
							>
								{selectedClass.className}
							</option>
						))}
					</select>
				</div>
				<div
					contentEditable
					onInput={handleInputChange}
					spellCheck="false"
					autoCorrect="off"
					className="overflow-scroll border border-solid border-gray-500 p-2 rounded-lg text-start h-5/6"
					id="studentList"
				/>
				<div className="w-full flex justify-center h-1/6 items-center">
					<input
						type="submit"
						value={"Register"}
						className="bg-gray-700 px-8 py-4 rounded-xl hover:bg-gray-600 transition duration-200 ease-in-out border-2 border-gray-500 hover:border-gray-400 text-white font-bold cursor-pointer"
					/>
				</div>
			</form>
		</div>
	);
}
