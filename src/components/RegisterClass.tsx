import { getDatabase, set, ref, get } from "firebase/database";

export default function RegisterClass() {
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const className = event.currentTarget.classes.value;
		const classCode = event.currentTarget.classCode.value;
		if (classCode === "" || className === "") {
			alert("You have to input something!");
			return;
		}

		event.currentTarget.reset();

		const db = getDatabase();
		const dbRef = ref(db, "classes");
		const data: { className: string; classCode: string }[] = [];
		await get(dbRef)
			.then((snapshot) => {
				if (snapshot.exists()) {
					data.push(...snapshot.val());
				}
				data.push({ className: className, classCode: classCode });
			})
			.catch((error) => {
				console.error(error);
			});
		console.log(data);
		await set(dbRef, data)
			.then(() => {
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
					<label htmlFor="classCode" className="text-lg">
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
		</div>
	);
}
