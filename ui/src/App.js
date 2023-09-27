import { 
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import './lib/statics';

import { AssertAuthenticated } from "./lib/auth/Authenticated";
import { DashboardOutlet } from "./components/dashboard/outlet/Outlet";


import Login from "./pages/login/Login";
import Home from "./pages/home/Home"
import { FourOhFour } from "./pages/fourOhFour/FourOhFour";
import UpcomingEvents from "./pages/upcomingEvents/UpcomingEvents";
import Lessons from "./pages/lessons/Lessons";
import Teachers from "./pages/teachers/Teachers";
import UserProfile from "./pages/userProfile/UserProfile";
import WatchRequest from "./pages/watchRequest/WatchRequest";
import Requests from "./pages/requests/Requests";
import { SubmitReview } from "./pages/submitReview/SubmitReview";
import AssessmentHome from "./pages/assessmentHome/AssessmentHome";
import { SubmitAssessmentScores } from "./pages/submitAssessmentScores/SubmitAssessmentScores";
import { CreateAssessment } from "./pages/createAssessment/CreateAssessment";
import ReviewAssessment from "./pages/reviewAssessment/ReviewAssessment";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<FourOhFour />} />
                <Route path="/"  element={<Login />}/>

                <Route path="/app/" element={<AssertAuthenticated />}>
                    <Route path="/app/" element={<DashboardOutlet />}>
                        <Route path="*" element={<FourOhFour />} />
                        <Route path="/app/" element={<Home />} />
                        <Route path="/app/upcoming-events" element={<UpcomingEvents />} />
                        <Route path="/app/lessons" element={<Lessons />} />
                        <Route path="/app/teachers" element={<Teachers />} />
                        <Route path="/app/requests" element={<Requests />} />
                        <Route path="/app/teachers/:userId" element={<UserProfile />} />
                        <Route path="/app/teachers/:userId/watch" element={<WatchRequest type="watch" />} />
                        <Route path="/app/teachers/:userId/assess" element={<WatchRequest type="assess" />} />
                        <Route path="/app/reviews/:reviewId/complete" element={<SubmitReview />} />
                        <Route path="/app/assessments" element={<AssessmentHome />} />
                        <Route path="/app/assessments/:assessmentId" element={<ReviewAssessment />} />
                        <Route path="/app/assessments/create" element={<CreateAssessment />} />
                        <Route path="/app/assessments/:assessmentId/submit" element={<SubmitAssessmentScores />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}