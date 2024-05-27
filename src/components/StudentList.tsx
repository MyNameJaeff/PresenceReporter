import type { StudentType } from "./StudentRegister";

export default function StudentList({
	students,
	selectedClass,
	handleClassSubmit,
	setLoggedIn,
}: {
	students: StudentType[];
	selectedClass: { className: string; classCode: string; students: StudentType[] };
	handleClassSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	setLoggedIn: (value: boolean) => void;
}) {
	return (
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
				<ul className="w-5/6 h-3/4 overflow-scroll font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
					{students[0].student !== "" ? (
						students.map((student, index) => (
							<li
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								className={`flex p-2 ${index === students.length - 1 ? "" : "border-b"
									} border-gray-200 rounded-t-lg dark:border-gray-400`}
							>
								{console.log(typeof student.student)}
								{/* <p className="grow">{student.student}</p> */}
								{
									student.present ? (
										<p className="text-green-500">Present</p>
									) : (
										<p className="text-red-500">Absent</p>
									)
								}
								<input
									type="checkbox"
									name={student.student + index}
									className="p-2 w-5 h-5 ml-auto rounded-lg border border-gray-200 dark:border-gray-400 dark:bg-gray-700 dark:text-white hover:bg-gray-200 hover:border-gray-400 transition duration-200 ease-in-out cursor-pointer"
								/>
							</li>
						))
					) : (
						<p className="p-4">No students registered</p>
					)}
				</ul>
				<input
					type="submit"
					value={"Submit Rapport"}
					className="bg-gray-700 px-8 py-4 mb-16 rounded-xl hover:bg-gray-600 transition duration-200 ease-in-out border-2 border-gray-500 hover:border-gray-400 text-white font-bold cursor-pointer"
				/>
			</form>
			<button
				onClick={() => {
					setLoggedIn(false);
					localStorage.clear();
				}}
				type="button"
				className="absolute mr-auto bottom-1 left-1 bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition duration-200 ease-in-out cursor-pointer"
			>
				Logout
			</button>
		</div>
	);
}
