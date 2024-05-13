import React from "react";
import Login from "./Login";
import { getDatabase, ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

type ReportProps = {
	className: string;
	classCode: string;
	students: { present: string[]; absent: string[] };
};

export default function ReportsPage() {
	const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
	const [selectedClassCode, setSelectedClassCode] = React.useState<string>("");
	const [reports, setReports] = React.useState<ReportProps[]>([]);
	const [classes, setClasses] = React.useState<ReportProps[]>([]);
    const [selectedDate, setSelectedDate] = React.useState<string>("");

	const navigate = useNavigate();

	//* Check if the user is authenticated when the component mounts
	React.useEffect(() => {
		const handleAuth = () => {
			if (localStorage.getItem("adminLoggedIn") === "true") {
				setIsAuthenticated(true);
			}
		};
		handleAuth();
	}, []);

	React.useEffect(() => {
		const getReports = () => {
			const db = getDatabase();
			const dbRef = ref(db, "reports/");
			get(dbRef).then((snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.val();
					setReports(data);
				}
			});
		};
		getReports();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <I want to clear selected code on dateClicks, which updates the classes variable>
	React.useEffect(() => {
		setSelectedClassCode("");
	}, [classes]);

	const handleDateClick = (date: string) => {
        setSelectedDate(date);
		const getClasses = async () => {
			const db = getDatabase();
			const dbRef = ref(db, `reports/${date}`);
			await get(dbRef).then((snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.val();
					setClasses(data);
				}
			});
		};
		getClasses();
	};

	const handleClassClick = (classCode: string) => {
		setSelectedClassCode(classCode);
	};

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const radioButtons = document.querySelectorAll<HTMLInputElement>(
			'input[type="radio"]',
		);

		// Create a new object mirroring the selected class
		const classObject: ReportProps =
			classes[selectedClassCode as unknown as number];
		const presentStudents: string[] = [];
		const absentStudents: string[] = [];

		// Loop through each radio button
		for (const radioButton of radioButtons) {
			// Check if the radio button is checked
			if (radioButton.checked) {
				// Extract the name and value of the checked radio button
				const id = radioButton.id;
				// If the radio buttons id ends with Absent, then the student is absent
				if (id.endsWith("Absent")) {
					absentStudents.push(id.slice(0, -6));
				} else {
					presentStudents.push(id.slice(0, -7));
				}
			}
		}
		classObject.students.absent = absentStudents;
		classObject.students.present = presentStudents;
		
        // Update the database with the new object
        const db = getDatabase();
        const dbRef = ref(db, `reports/${selectedDate}/${selectedClassCode}`);
        set(dbRef, classObject).then(() => {
            alert("Report submitted successfully!");
        }
        ).catch((error) => {
            alert(`Failed to submit report: ${error}`);
        });

	};

	return (
		<div className="h-screen w-screen">
			{isAuthenticated ? (
				<div className="h-full w-full flex flex-row font-mono">
					<div className="w-1/6 h-full border-r-2 border-solid border-white">
						<h1 className="text-xl border-b-2 border-white pl-2">Dates</h1>
						<ul className="h-[92%] p-2 overflow-scroll">
							{Object.keys(reports).map((date) => (
								<li
									key={date}
									onClick={() => handleDateClick(date)}
									onKeyDown={() => handleDateClick(date)}
									className="hover:text-gray-400 cursor-pointer"
								>
									{date}
								</li>
							))}
						</ul>
						<button
							type="button"
							onClick={() => navigate("/admin")}
							className="absolute bottom-0 left-0 p-2 bg-blue-500 rounded-tr-xl hover:bg-blue-400"
						>
							Go back
						</button>
					</div>
					<div className="w-1/6 h-full border-r-2 border-solid border-white">
						<h1 className="text-xl border-b-2 border-white pl-2">Classes</h1>
						<ul className="h-[92%] p-2 overflow-scroll">
							{Object.keys(classes).map((classCode) => (
								<li
									key={classCode}
									className="hover:text-gray-400 cursor-pointer"
									onClick={() => handleClassClick(classCode)}
									onKeyDown={() => handleClassClick(classCode)}
								>
									{classCode}
								</li>
							))}
						</ul>
					</div>
					<div className="w-4/6 h-full">
						<h1 className="text-xl border-b-2 border-white pl-2">Reports</h1>
						{selectedClassCode !== "" ? (
							<form
								className="p-2 h-[90%]"
								onSubmit={(event) => handleFormSubmit(event)}
							>
								<div className="h-[95%] overflow-scroll">
									<div className="w-full px-1 flex justify-between">
										<h1 className="text-xl ">
											{/* Had to add the check if undefined if the user wanted to switch between reports because react is a bit slow */}
											{classes[selectedClassCode as unknown as number] !==
											undefined
												? classes[selectedClassCode as unknown as number]
														.className
												: ""}
										</h1>
										<div className="flex flex-row w-1/6 justify-around">
											<h1 className="text-green-300">Present</h1>
											<h1 className="text-red-300">Absent</h1>
										</div>
									</div>
									<div>
										<div className="mt-4">
											<p className="text-lg border-b-2 text-red-300">Absent</p>
											<ul className="p-2">
												{/* //! Typescript, but badly made. Could be improved */}
												{classes[selectedClassCode as unknown as number] !==
												undefined
													? (
															classes[selectedClassCode as unknown as number]
																.students as unknown as { absent: string[] }
														).absent.map((student) => (
															<li
																key={student}
																className="flex flex-row justify-between"
															>
																{student}
																<div className="flex flex-row w-1/6 justify-around">
																	<input
																		type="radio"
																		id={`${student}Present`}
																		name={`${student}Precense`}
																		className="w-4 h-4"
																		readOnly
																	/>
																	<input
																		type="radio"
																		id={`${student}Absent`}
																		name={`${student}Precense`}
																		checked
																		className="w-4 h-4"
																		readOnly
																	/>
																</div>
															</li>
														))
													: ""}
											</ul>
										</div>
										<div className="mt-4 ">
											<p className="text-lg border-b-2 text-green-300">
												Present
											</p>
											<ul className="p-2">
												{/* //! Typescript, but badly made. Could be improved */}
												{classes[selectedClassCode as unknown as number] !==
												undefined
													? (
															classes[selectedClassCode as unknown as number]
																.students as unknown as { present: string[] }
														).present.map((student) => (
															<li
																key={student}
																className="flex flex-row justify-between"
															>
																{student}
																<div className="flex flex-row w-1/6 justify-around">
																	<input
																		type="radio"
																		id={`${student}Present`}
																		name={`${student}Precense`}
																		checked
																		className="w-4 h-4"
																		readOnly
																	/>
																	<input
																		type="radio"
																		id={`${student}Absent`}
																		name={`${student}Precense`}
																		className="w-4 h-4"
																		readOnly
																	/>
																</div>
															</li>
														))
													: ""}
											</ul>
										</div>
									</div>
								</div>
								<input
									type="submit"
									value="Submit"
									className="bg-blue-500 p-2 rounded-lg hover:bg-blue-400"
								/>
							</form>
						) : (
							""
						)}
					</div>
				</div>
			) : (
				<Login
					setIsAuthenticated={setIsAuthenticated}
					passcode="admin"
					storageKey="adminLoggedIn"
				/>
			)}
		</div>
	);
}
