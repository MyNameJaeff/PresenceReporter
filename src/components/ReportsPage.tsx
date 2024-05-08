import React from "react";
import AdminLogin from "./AdminLogin";
import { getDatabase, ref, get } from "firebase/database";

type ReportProps = {
    className: string;
    classCode: string;
    students: string[];
};

export default function ReportsPage() {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
    const [selectedClassCode, setSelectedClassCode] = React.useState<string>("");
    const [reports, setReports] = React.useState<ReportProps[]>([]);
    const [classes, setClasses] = React.useState<ReportProps[]>([]);

    //* Check if the user is authenticated when the component mounts
    React.useEffect(() => {
        const handleAuth = () => {
            if (localStorage.getItem("authenticated") === "true") {
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
        }
        getReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* const dataStucture: {
        className: string;
        classCode: string;
        students: string[];
    } = { className: "", classCode: "", students: [] }; */

    const handleDateClick = (date: string) => {
        const getClasses = () => {
            const db = getDatabase();
            const dbRef = ref(db, `reports/${date}`);
            get(dbRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setClasses(data);
                }
            });
        }
        getClasses();
    }

    const handleClassClick = (classCode: string) => {
        setSelectedClassCode(classCode);
    }

    return (
        <div className="h-screen w-screen">
            {isAuthenticated ? (
                <div className="h-full w-full flex flex-row font-mono">
                    <div className="w-1/6 h-full border-r-2 border-solid border-white">
                        <h1 className="text-xl border-b-2 border-white pl-2">Dates</h1>
                        <ul className="h-full p-2 ">
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
                    </div>
                    <div className="w-1/6 h-full border-r-2 border-solid border-white">
                        <h1 className="text-xl border-b-2 border-white pl-2">Classes</h1>
                        <ul className="h-full p-2">
                            {Object.keys(classes).map((classCode) => (
                                <li key={classCode} className="hover:text-gray-400 cursor-pointer"
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
                        {selectedClassCode ?
                            <div className="p-2">
                                <h1 className="text-xl w-1/6 px-1">
                                    {classes[selectedClassCode as unknown as number].className}
                                </h1>
                                <div>
                                    <div className="mt-4">
                                        <p className="text-lg border-b-2 text-red-300">Absent</p>
                                        <ul className="p-2">
                                            {/* //! Typescript, but badly made. Could be improved */}
                                            {(classes[selectedClassCode as unknown as number].students as unknown as { absent: string[] }).absent.map((student) => (
                                                <li key={student}>{student}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-4 ">
                                        <p className="text-lg border-b-2 text-green-300">Present</p>
                                        <ul className="p-2">
                                            {/* //! Typescript, but badly made. Could be improved */}
                                            {(classes[selectedClassCode as unknown as number].students as unknown as { present: string[] }).present.map((student) => (
                                                <li key={student}>{student}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            : ""}
                    </div>
                </div>
            ) : (
                <AdminLogin setIsAuthenticated={setIsAuthenticated} />
            )}
        </div>
    );
}