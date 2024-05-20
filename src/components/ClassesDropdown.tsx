interface StudentRegisterProps {
	className: string;
	classCode: string;
}

export default function ClassesDropdown({
	classList,
	handleCodeSubmit,
}: {
	classList: StudentRegisterProps[];
	handleCodeSubmit: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
	return (
		<form className="flex flex-row justify-center items-center">
			<select
				id="classes"
				name="classes"
				className="p-1 ml-2 rounded bg-gray-700"
				onChange={(event) => {
					handleCodeSubmit(event);
				}}
			>
				{Object.entries(classList).length > 0 ? (
					Object.entries(classList).map(([key, value]) => (
						<option key={key} value={value.classCode}>
							{value.className}
						</option>
					))
				) : (
					<option>No classes registered</option>
				)}
			</select>
		</form>
	);
}
