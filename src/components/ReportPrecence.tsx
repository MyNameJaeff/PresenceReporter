import React, { useState } from "react";
import { getDatabase, ref, set, get } from "firebase/database";
import Login from "./Login";
import StudentList from "./StudentList";
import ClassesDropdown from "./ClassesDropdown";

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
					<ClassesDropdown classList={classList} handleCodeSubmit={handleCodeSubmit} />
					{selectedClass.className !== "" && (
						<StudentList students={students} selectedClass={selectedClass} handleClassSubmit={handleClassSubmit} setLoggedIn={setLoggedIn} />
					)}
				</div>
			) : (
				<Login
					setIsAuthenticated={setLoggedIn}
					passcode="password"
					storageKey="loggedIn"
				/>
			)}
		</div>
	);
}
