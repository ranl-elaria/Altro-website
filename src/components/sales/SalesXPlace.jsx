// XPlace sub-tab — minimal shell that mounts the existing AdminDashboard
// XPlace tab. "Convert to Deal" lives in DealDetail flow via Inbox: future enhancement
// will add per-row Convert action by extending AdminDashboard. For v1 we ship the
// existing xplace UI unchanged and qualify-from-inbox-by-clone is the path.

import AdminDashboard from '../AdminDashboard'

export default function SalesXPlace() {
  return <AdminDashboard initialTab="xplace" hideTabs />
}
