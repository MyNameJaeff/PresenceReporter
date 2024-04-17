import { useState } from "react";
import { getDatabase, ref, get, set } from "firebase/database";

interface classDataType {
	className: string;
	classCode: string;
	students: string[];
}

export default function ReportPrecence() {
	const [classCode, setClassCode] = useState<string>("");
	const [selectedClass, setSelectedClass] = useState<classDataType>({
		className: "",
		classCode: "",
		students: [],
	});
	const [students, setStudents] = useState<string[]>([]);

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

	const handleCodeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const code = event.currentTarget.classCode.value;
		if (code === "") {
			alert("You have to input something!");
			return;
		}
		checkClassCode(code);
		setClassCode(code);
		event.currentTarget.reset();
	};

	const handleClassSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
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
				const data = snapshot.val();
				data.students.push(studentsPrecence);
				set(dbRef, data)
					.then(() => {
						console.log("Data saved successfully!");
					})
					.catch((error) => {
						console.error(error);
					});
			} else {
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
		/* set(dbRef, selectedClass as classDataType)
			.then(() => {
				console.log("Data saved successfully!");
			})
			.catch((error: Error) => {
				console.error(error);
			}); */
		console.log(studentsPrecence);
		//! event.currentTarget.reset();
	};

	return (
		<div className="h-screen w-screen flex flex-col items-center p-5">
			<h1 className="text-3xl w-full text-center">Report Precence</h1>
			{classCode === "" ? (
				<form onSubmit={handleCodeSubmit}>
					<label htmlFor="classCode">Class Code:</label>
					<input type="text" id="classCode" />
					<input type="submit" value={"Submit"} />
				</form>
			) : (
				<div className="w-full h-5/6 flex flex-col items-center p-2">
					<div className="w-5/6 flex flex-col items-center h-full">
						<h2 className="text-2xl border-b-2 border-white w-4/5 px-2">
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
											className="p-2"
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
					</div>
				</div>
			)}
		</div>
	);
}
