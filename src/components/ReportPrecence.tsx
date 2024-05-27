import React, { useState } from "react";
import { getDatabase, ref, set, get } from "firebase/database";
import Login from "./Login";
import StudentList from "./StudentList";
import ClassesDropdown from "./ClassesDropdown";
import type { StudentType } from "./StudentRegister";

//TODO Add a check if there is a rapport then check based on the date if there is a rapport for the class check the boxes of students that are present
//TODO Make it possible to re-send a rapport if the teacher made a mistake or if the teacher forgot to send the rapport
interface classDataType {
	className: string;
	classCode: string;
	students: StudentType[];
	teacherCode: string;
}
interface StudentRegisterProps {
	className: string;
	classCode: string;
}

interface StudentPrecence {
	student: string;
	present: boolean;
}

export default function ReportPrecence() {
	const [classList, setClassList] = useState<StudentRegisterProps[]>([]);
	const [loggedIn, setLoggedIn] = useState<boolean>(false);
	const [selectedClass, setSelectedClass] = useState<classDataType>({
		className: "",
		classCode: "",
		students: [],
		teacherCode: "",
	});
	const [students, setStudents] = useState<StudentType[]>([]);
	const [classCodes, setClassCodes] = useState<string[]>([]);

	React.useEffect(() => {
		const db = getDatabase();
		const dbRef = ref(db, "classRegister");

		//* Fetch class data from database
		const fetchClassData = async () => {
			const snapshot = await get(dbRef);
			if (snapshot.exists()) {
				const data: Record<string, StudentRegisterProps> = snapshot.val();
				const dataArray = Object.values(data);
				setClassList(dataArray);
				checkClassCode(dataArray[0].classCode, dataArray[0].className);
				const codes = dataArray.map((item) => item.classCode);
				setClassCodes(codes);
			}
		};

		//* Check if the user is logged in when the component mounts
		const initialize = async () => {
			await fetchClassData();
			const loggedIn = localStorage.getItem("loggedIn") === "true";
			if (loggedIn) {
				setLoggedIn(true);
			}
		};

		initialize();
	}, []);

	const checkClassCode = async (classCode: string, className: string) => {
		//* Check if the class code exists
		//* If it does, set the class code
		//* If it doesn't, alert the user
		const date = new Date();
		const formattedDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

		const db = getDatabase();
		const doesReportExist = ref(db, `reports/${formattedDate}/${className}`);
		await get(doesReportExist).then((snapshot) => {
			if (snapshot.exists()) {
				setSelectedClass(snapshot.val());
				console.log("Rapport already exists for this class!");
				console.log(snapshot.val().students);
				setStudents(snapshot.val().students);
				return;
			}
		});
		const classRef = ref(db, `classRegister/${classCode}`);
		get(classRef)
			.then((snapshot) => {
				if (snapshot.exists()) {
					setSelectedClass(snapshot.val());
					console.log("Class code exists!");
					console.log(snapshot.val().students);
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
		checkClassCode(event.target.value, event.target.selectedOptions[0].text);
	};

	const handleClassSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const students = selectedClass.students;

		const studentsPrecence: { students: StudentPrecence[] } = {
			students: [],
		};
		students.forEach((student, index) => {
			const checkbox = event.currentTarget[student.student + index];
			if (checkbox.checked) {
				studentsPrecence.students.push({ student: student.student, present: true });
			} else {
				studentsPrecence.students.push({ student: student.student, present: false });
			}
		});
		selectedClass.students = studentsPrecence.students.map((student) => ({
			student: student.student,
			present: student.present,
		}));
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
				console.log(data);
			} else {
				//* If there is no report for this class on this date we create a new report
				const data = {
					students: studentsPrecence.students,
					className: selectedClass.className,
					classCode: selectedClass.classCode,
					teacherCode: localStorage.getItem("classCode"),
				};
				set(dbRef, data)
					.then(() => {
						alert("Rapport skickad!");
					})
					.catch((error) => {
						console.error(error);
					});
			}
		});
		event.currentTarget.reset();
	};

	return (
		<div className="h-full w-screen flex flex-col items-center p-5">
			{loggedIn ? (
				<div className="h-full w-full">
					<div className="flex">
						<h1 className="text-3xl text-center w-5/6">Report Precence</h1>
						<ClassesDropdown
							classList={classList}
							handleCodeSubmit={handleCodeSubmit}
						/>
					</div>
					{selectedClass.className !== "" && (
						<StudentList
							students={students}
							selectedClass={selectedClass}
							handleClassSubmit={handleClassSubmit}
							setLoggedIn={setLoggedIn}
						/>
					)}
				</div>
			) : (
				<Login
					setIsAuthenticated={setLoggedIn}
					passcode={classCodes}
					storageKey="loggedIn"
				/>
			)}
		</div>
	);
}
