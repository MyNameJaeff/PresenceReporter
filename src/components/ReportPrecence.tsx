import React, { useState } from "react";
import { getDatabase, ref, set, get } from "firebase/database";

interface classDataType {
	className: string;
	classCode: string;
	students: string[];
}
interface StudentRegisterProps {
	className: string;
	classCode: string;
}

export default function ReportPrecence() {
	const [classList, setClassList] = useState<StudentRegisterProps[]>([]);
	const [loggedIn, setLoggedIn] = useState<boolean>(false);
	const [selectedClass, setSelectedClass] = useState<classDataType>({
		className: "",
		classCode: "",
		students: [],
	});
	const [students, setStudents] = useState<string[]>([]);

	React.useEffect(() => {
		const db = getDatabase();
		const dbRef = ref(db, "classRegister");
		get(dbRef).then((snapshot) => {
			if (snapshot.exists()) {
				const data: Record<string, StudentRegisterProps> = snapshot.val();
				const dataArray = Object.values(data);
				setClassList(dataArray);
				checkClassCode(dataArray[0].classCode);
			}
		});

		localStorage.getItem("loggedIn") === "true"
			? setLoggedIn(true)
			: handleLogin();
	}, []);

	const handleLogin = () => {
		const passwordEntry = window.prompt("Enter the password to login");
		if (passwordEntry !== "password") {
			//! This is a temporary password for testing purposes only, it should be changed to a more secure password
			alert("Incorrect password!");
			setLoggedIn(false);
			return;
		}
		localStorage.setItem("loggedIn", "true");
		setLoggedIn(true);
	};

	const checkClassCode = (classCode: string) => {
		//* Check if the class code exists
		//* If it does, set the class code
		//* If it doesn't, alert the user
		const db = getDatabase();
		const classRef = ref(db, `classRegister/${classCode}`);
		get(classRef)
			.then((snapshot) => {
				if (snapshot.exists()) {
					setSelectedClass(snapshot.val());
					setStudents(snapshot.val().students);
				} else {
					alert("Class code does not exist!");
				}
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleCodeSubmit = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setStudents([]);
		checkClassCode(event.target.value);
	};

	const handleClassSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		alert("Rapport skickad!");
		const students = selectedClass.students;
		const studentsPrecence: { present: string[]; absent: string[] } = {
			present: [],
			absent: [],
		};
		students.forEach((student, index) => {
			const checkbox = event.currentTarget[student + index];
			if (checkbox.checked) {
				studentsPrecence.present.push(student);
			} else {
				studentsPrecence.absent.push(student);
			}
		});
		selectedClass.students = studentsPrecence.present;
		const date = new Date();
		const formattedDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
		const db = getDatabase();
		const dbRef = ref(
			db,
			`reports/${formattedDate}/${selectedClass.className}`,
		);
		get(dbRef).then((snapshot) => {
			if (snapshot.exists()) {
				//* If there is already a report for this class on this date we add the new data to the existing data as an array
				const data = snapshot.val();
				data.students.absent.push(studentsPrecence.absent);
				data.students.present.push(studentsPrecence.present);
				set(dbRef, data)
					.then(() => {
						console.log("Data saved successfully!");
					})
					.catch((error) => {
						console.error(error);
					});
			} else {
				//* If there is no report for this class on this date we create a new report
				const data = {
					students: studentsPrecence,
					className: selectedClass.className,
					classCode: selectedClass.classCode,
				};
				set(dbRef, data)
					.then(() => {
						console.log("Data saved successfully!");
					})
					.catch((error) => {
						console.error(error);
					});
			}
		});

		console.log(studentsPrecence);
		event.currentTarget.reset();
	};

	return (
		<div className="h-full w-screen flex flex-col items-center p-5">
			{loggedIn ? (
				<div className="h-full w-full">
					<form className="w-full flex flex-row justify-center items-center">
						<h1 className="text-3xl text-center">Report Precence</h1>
						<select
							id="classes"
							name="classes"
							className="p-1 ml-2 rounded bg-gray-700"
							onChange={(event) => {
								handleCodeSubmit(event);
							}}
						>
							{Object.entries(classList).map(([key, value]) => (
								<option key={key} value={value.classCode}>
									{value.className}
								</option>
							))}
						</select>
					</form>
					{selectedClass.className !== "" && (
						<div
							className="w-full flex flex-col items-center p-5"
							style={{ height: "98%" }}
						>
							<h2 className="text-2xl border-b-2 border-white w-full px-2">
								Class: {selectedClass.className}
							</h2>
							<form
								onSubmit={handleClassSubmit}
								className="pt-2 flex flex-col items-center justify-around w-full h-full"
							>
								<ul className="w-5/6 h-5/6 overflow-scroll font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
									{students.map((student, index) => (
										<li
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={index}
											className={`flex p-2 ${
												index === students.length - 1 ? "" : "border-b"
											} border-gray-200 rounded-t-lg dark:border-gray-400`}
										>
											<p className="grow">{student}</p>
											<input
												type="checkbox"
												name={student + index}
												className="p-2 w-5 h-5 ml-auto rounded-lg border border-gray-200 dark:border-gray-400 dark:bg-gray-700 dark:text-white hover:bg-gray-200 hover:border-gray-400 transition duration-200 ease-in-out cursor-pointer"
											/>
										</li>
									))}
								</ul>
								<input
									type="submit"
									value={"Submit Rapport"}
									className="bg-gray-700 px-8 py-4 rounded-xl hover:bg-gray-600 transition duration-200 ease-in-out border-2 border-gray-500 hover:border-gray-400 text-white font-bold cursor-pointer"
								/>
							</form>
							<button
								onClick={() => {
									setLoggedIn(false);
									localStorage.setItem("loggedIn", "false");
								}}
								type="button"
								className="absolute mr-auto bottom-1 left-1 bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition duration-200 ease-in-out cursor-pointer"
							>
								Logout
							</button>
						</div>
					)}
				</div>
			) : (
				<button
					type="button"
					onClick={handleLogin}
					className="bg-blue-400 px-4 py-2 rounded-lg text-white hover:bg-blue-500 transition duration-200 ease-in-out cursor-pointer"
				>
					Login
				</button>
			)}
		</div>
	);
}
