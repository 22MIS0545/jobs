import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---

type UserRole = 'guest' | 'user' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  status: 'pending' | 'approved' | 'rejected';
  postedBy: string; // user email
  createdAt: number;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  resumeLink: string;
  submittedAt: number;
}

// --- Mock Data & Service ---

const MOCK_ADMIN_EMAIL = "admin@example.com";

const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow',
    location: 'Remote',
    description: 'We are looking for a creative engineer to build beautiful interfaces using React and Tailwind.',
    skills: ['React', 'TypeScript', 'Tailwind'],
    status: 'approved',
    postedBy: 'admin@example.com',
    createdAt: Date.now() - 10000000,
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'PixelStudio',
    location: 'New York, NY',
    description: 'Design intuitive user experiences for our next-gen creative tools.',
    skills: ['Figma', 'UI/UX', 'Prototyping'],
    status: 'approved',
    postedBy: 'user@example.com',
    createdAt: Date.now() - 5000000,
  },
  {
    id: '3',
    title: 'Junior Developer',
    company: 'StartUp Inc',
    location: 'San Francisco, CA',
    description: 'Great opportunity for learning and growth in a fast-paced environment.',
    skills: ['JavaScript', 'HTML', 'CSS'],
    status: 'pending',
    postedBy: 'newuser@example.com',
    createdAt: Date.now(),
  }
];

// --- Icons (Inline SVG) ---

const Icons = {
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-green-50 text-green-600 hover:bg-green-100",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      {...props} 
      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
    />
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <textarea 
      {...props} 
      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all min-h-[120px]"
    />
  </div>
);

const Badge = ({ children, color = 'indigo' }: any) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    gray: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  );
};

// --- Main Application ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'jobs' | 'post' | 'job-detail' | 'apply' | 'admin'>('home');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Mock Authentication Logic
  const handleLogin = (role: 'user' | 'admin') => {
    const email = role === 'admin' ? MOCK_ADMIN_EMAIL : 'jane@example.com';
    setUser({
      id: role === 'admin' ? 'admin-1' : 'user-1',
      name: role === 'admin' ? 'Admin User' : 'Jane Doe',
      email: email,
      role: role === 'admin' ? 'admin' : 'user',
      avatar: `https://ui-avatars.com/api/?name=${role === 'admin' ? 'Admin' : 'Jane'}&background=random`
    });
    setToast({ msg: `Welcome back, ${role === 'admin' ? 'Admin' : 'Jane'}!`, type: 'success' });
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setToast({ msg: 'Logged out successfully', type: 'success' });
  };

  const handlePostJob = (jobData: Omit<Job, 'id' | 'status' | 'postedBy' | 'createdAt'>) => {
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      status: user?.role === 'admin' ? 'approved' : 'pending',
      postedBy: user?.email || '',
      createdAt: Date.now(),
    };
    setJobs([newJob, ...jobs]);
    setView('jobs');
    setToast({ 
      msg: user?.role === 'admin' ? 'Job posted successfully!' : 'Job submitted for approval.', 
      type: 'success' 
    });
  };

  const handleApply = (appData: Omit<Application, 'id' | 'submittedAt'>) => {
    const newApp: Application = {
      ...appData,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: Date.now(),
    };
    setApplications([newApp, ...applications]);
    setView('jobs');
    setToast({ msg: 'Application submitted successfully!', type: 'success' });
  };

  const handleApproveJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'approved' } : j));
    setToast({ msg: 'Job approved.', type: 'success' });
  };

  const handleRejectJob = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
    setToast({ msg: 'Job rejected.', type: 'error' });
  };

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Views ---

  const Navbar = () => (
    <nav className="fixed top-0 w-full glass z-50 border-b border-white/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Icons.Briefcase />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">JobFlow</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setView('jobs')} className={`text-sm font-medium ${view === 'jobs' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>Find Jobs</button>
          
          {user ? (
            <>
              <button onClick={() => setView('post')} className={`text-sm font-medium ${view === 'post' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>Post Job</button>
              {user.role === 'admin' && (
                <button onClick={() => setView('admin')} className={`text-sm font-medium ${view === 'admin' ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>Admin</button>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
                <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500">Sign Out</button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 pl-4">
              <button onClick={() => handleLogin('user')} className="text-sm font-medium text-slate-600 hover:text-indigo-600">Login</button>
              <Button onClick={() => handleLogin('admin')} variant="primary" className="!py-1.5 !text-sm">
                <Icons.Google /> <span className="text-white">Sign in</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
      <Badge color="indigo">New v2.0</Badge>
      <h1 className="mt-6 text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
        Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">creative career</span>.
      </h1>
      <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
        JobFlow is the simplest way to find and post jobs. No clutter, just opportunities.
        Connect with top companies today.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={() => setView('jobs')} className="!px-8 !py-3 !text-lg">Browse Jobs</Button>
        <Button onClick={() => user ? setView('post') : handleLogin('user')} variant="secondary" className="!px-8 !py-3 !text-lg">Post a Job</Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { title: 'Curated Jobs', desc: 'Only the best opportunities, approved by humans.' },
          { title: 'Simple Apply', desc: 'No long forms. Apply in seconds with your link.' },
          { title: 'For Creatives', desc: 'Built for designers, developers, and makers.' }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">{feat.title}</h3>
            <p className="text-slate-600 text-sm">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const JobsView = () => {
    const approvedJobs = jobs.filter(j => j.status === 'approved');
    
    return (
      <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Latest Openings</h2>
          <span className="text-sm text-slate-500">{approvedJobs.length} jobs found</span>
        </div>

        <div className="grid gap-4">
          {approvedJobs.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              No jobs found. Be the first to post one!
            </div>
          ) : (
            approvedJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => { setSelectedJobId(job.id); setView('job-detail'); }}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <p className="text-slate-600 font-medium">{job.company}</p>
                  </div>
                  <Badge color="gray">{job.location}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const JobDetailView = () => {
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return <div>Job not found</div>;

    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">
        <Button onClick={() => setView('jobs')} variant="ghost" className="mb-6 !pl-0">← Back to Jobs</Button>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <span className="font-medium text-slate-900">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Icons.MapPin /> {job.location}</span>
              </div>
            </div>
            {job.status === 'approved' && (
              <Button onClick={() => setView('apply')} className="!px-6">Apply Now <Icons.ArrowRight /></Button>
            )}
          </div>

          <div className="border-t border-slate-100 my-6 pt-6">
            <h3 className="font-bold text-slate-900 mb-3">About the role</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="border-t border-slate-100 my-6 pt-6">
            <h3 className="font-bold text-slate-900 mb-3">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(s => <Badge key={s} color="indigo">{s}</Badge>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PostJobView = () => {
    const [formData, setFormData] = useState({ title: '', company: '', location: '', description: '', skills: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handlePostJob({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      });
    };

    return (
      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Post a Job</h2>
          <p className="text-slate-500 mt-2">Find the best talent for your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <Input 
            label="Job Title" 
            placeholder="e.g. Senior Product Designer"
            value={formData.title}
            onChange={(e: any) => setFormData({...formData, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Company Name" 
              placeholder="e.g. Acme Corp"
              value={formData.company}
              onChange={(e: any) => setFormData({...formData, company: e.target.value})}
              required
            />
            <Input 
              label="Location" 
              placeholder="e.g. Remote / New York"
              value={formData.location}
              onChange={(e: any) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
          <TextArea 
            label="Job Description" 
            placeholder="Describe the role, responsibilities, and perks..."
            value={formData.description}
            onChange={(e: any) => setFormData({...formData, description: e.target.value})}
            required
          />
          <Input 
            label="Skills (comma separated)" 
            placeholder="React, Figma, Teamwork"
            value={formData.skills}
            onChange={(e: any) => setFormData({...formData, skills: e.target.value})}
          />
          
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setView('home')}>Cancel</Button>
            <Button type="submit">Post Job</Button>
          </div>
        </form>
      </div>
    );
  };

  const ApplyView = () => {
    const job = jobs.find(j => j.id === selectedJobId);
    const [formData, setFormData] = useState({ applicantName: '', email: '', resumeLink: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (job) {
        handleApply({
          jobId: job.id,
          jobTitle: job.title,
          ...formData
        });
      }
    };

    return (
      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Apply for {job?.title}</h2>
          <form onSubmit={handleSubmit}>
            <Input 
              label="Full Name" 
              value={formData.applicantName}
              onChange={(e: any) => setFormData({...formData, applicantName: e.target.value})}
              required
            />
            <Input 
              label="Email Address" 
              type="email"
              value={formData.email}
              onChange={(e: any) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input 
              label="Resume / Portfolio Link" 
              placeholder="https://..."
              value={formData.resumeLink}
              onChange={(e: any) => setFormData({...formData, resumeLink: e.target.value})}
              required
            />
            <Button type="submit" className="w-full justify-center mt-4">Submit Application</Button>
          </form>
        </div>
      </div>
    );
  };

  const AdminView = () => {
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    
    return (
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="text-slate-500">Manage jobs and applications.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Jobs Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Pending Jobs <Badge color="yellow">{pendingJobs.length}</Badge>
            </h3>
            {pendingJobs.length === 0 && <div className="text-slate-400 italic text-sm">No pending jobs.</div>}
            {pendingJobs.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{job.title}</h4>
                  <span className="text-xs text-slate-400">By: {job.postedBy}</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{job.company} • {job.location}</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleApproveJob(job.id)} variant="success" className="!py-1 !text-xs">Approve</Button>
                  <Button onClick={() => handleRejectJob(job.id)} variant="danger" className="!py-1 !text-xs">Reject</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Applications Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Recent Applications <Badge color="green">{applications.length}</Badge>
            </h3>
            {applications.length === 0 && <div className="text-slate-400 italic text-sm">No applications received yet.</div>}
            {applications.map(app => (
              <div key={app.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900">{app.applicantName}</h4>
                <p className="text-sm text-indigo-600 mb-1">Applied for: {app.jobTitle}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>{app.email}</p>
                  <a href={app.resumeLink} target="_blank" className="text-indigo-500 hover:underline">View Resume</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-50 via-white to-slate-50 -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />

      <Navbar />

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg text-white font-medium animate-bounce z-50 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <main>
        {view === 'home' && <HomeView />}
        {view === 'jobs' && <JobsView />}
        {view === 'job-detail' && <JobDetailView />}
        {view === 'post' && <PostJobView />}
        {view === 'apply' && <ApplyView />}
        {view === 'admin' && (user?.role === 'admin' ? <AdminView /> : <div className="pt-32 text-center text-red-500">Access Denied</div>)}
      </main>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
