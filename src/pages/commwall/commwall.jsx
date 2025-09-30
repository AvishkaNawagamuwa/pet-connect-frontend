import React, { useState } from 'react';
import bgPattern from '../../assets/bgw&b.png';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer'
// Main App component which acts as the single page for the community wall.
// It includes both the post submission form and the display of posts with comments.
const CommunityWall = () => {
  // Initial mock data for pet posts, now including posts with and without images.
  const [posts, setPosts] = useState([
    {
      id: '1',
      petName: 'Buddy',
      description: 'My furry best friend enjoying a sunny afternoon at the park! He loves chasing squirrels (unsuccessfully). What are your pets favorite outdoor activities?',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/01/05/17/51/maltese-1123016_1280.jpg',
      userName: 'Sarah M.',
      likes: 125,
      isLiked: false,
      comments: [
        { id: 'c1', userName: 'DogLover22', text: 'Buddy looks so happy! My golden loves playing fetch in the yard.' },
        { id: 'c2', userName: 'CatMom', text: 'So cute! My cat just enjoys sunbathing indoors. 😂' },
      ],
    },
    {
      id: '2',
      petName: 'Whiskers',
      description: 'Just woke up from a long nap on my favorite sunny spot. Ready for treats and cuddles! 😴 Any tips for getting a cat to play more?',
      imageUrl: '', // This post will now be text-only
      userName: 'Tom K.',
      likes: 88,
      isLiked: false,
      comments: [
        { id: 'c3', userName: 'PurrfectPal', text: 'Try a laser pointer or feather wand! My cat goes crazy for them.' },
        { id: 'c4', userName: 'FelineFriend', text: 'Some cats just prefer napping! Whiskers looks very content.' },
      ],
    },
    {
      id: '3',
      petName: 'Dash',
      description: 'Adventure time! Dash just discovered that tall grass is the best place to play hide and seek. What a goofball! What fun games do you play with your pets?',
      imageUrl: 'https://cdn.pixabay.com/photo/2014/12/10/05/50/english-bulldog-562723_1280.jpg',
      userName: 'Jessica P.',
      likes: 73,
      isLiked: false,
      comments: [],
    },
    {
      id: '4',
      petName: 'Pip',
      description: 'This is Pip, my tiny chinchilla friend! He loves his dust baths and getting little pieces of apple as a treat. So soft and curious! Anyone else have exotic pets?',
      imageUrl: '', // This post will also be text-only
      userName: 'Alex C.',
      likes: 45,
      isLiked: false,
      comments: [
        { id: 'c5', userName: 'ReptileFan', text: 'I have a bearded dragon! They are surprisingly affectionate.' },
      ],
    },
    {
      id: '5',
      petName: 'General Pet Care Tips',
      description: 'What are your go-to tips for keeping your pets healthy and happy? Share your wisdom on diet, exercise, grooming, or anything else!',
      imageUrl: '', // Another text-only post to emphasize discussion
      userName: 'ForumAdmin',
      likes: 30,
      isLiked: false,
      comments: [
        { id: 'c6', userName: 'VetTech', text: 'Regular vet check-ups are crucial, even if your pet seems fine!' },
        { id: 'c7', userName: 'HappyPaws', text: 'Daily walks and interactive toys keep my dog entertained and fit.' },
      ],
    },
  ]);

  // State for the new post form inputs
  const [petName, setPetName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // State to control the visibility of the post creation form (false by default)
  const [showPostForm, setShowPostForm] = useState(false);

  // Function to handle adding a new post
  const handleAddPost = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation
    if (!petName.trim() || !description.trim()) { // Image URL is truly optional
      alert('Please fill in the Topic/Pet Name and Your Post/Question fields!');
      return;
    }

    // Create a new post object
    const newPost = {
      id: Date.now().toString(), // Generate a simple unique ID based on timestamp
      petName: petName.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(), // Use trimmed URL, which can be empty
      userName: 'You', // Default user for new posts
      likes: 0,
      isLiked: false, // Initial state for liking
      comments: [], // New posts start with no comments
    };

    // Add the new post to the beginning of the posts array
    setPosts([newPost, ...posts]);

    // Clear the form fields after submission
    setPetName('');
    setDescription('');
    setImageUrl('');
    setShowPostForm(false); // Hide the form and show discussions after submission
  };

  // Function to handle toggling the like status of a post
  const handleLikeToggle = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1, // Increment/decrement likes
            isLiked: !post.isLiked, // Toggle liked status
          }
          : post
      )
    );
  };

  // Function to handle adding a comment to a specific post
  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) {
      alert('Comment cannot be empty!');
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now().toString(), // Unique ID for comment
                userName: 'Current User', // Placeholder for current user
                text: commentText.trim(),
              },
            ],
          }
          : post
      )
    );
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen font-inter text-[#5A4135] flex flex-col items-center pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative">

        <div
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgPattern})`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px 400px",
            opacity: 0.4,
            pointerEvents: "none",
            position: "fixed",
            inset: 0,
            zIndex: -1,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
          className="main-bg-pattern"
        />
        {/* Foreground Content */}

        <div className="relative z-10 w-full flex flex-col items-center">


          <header
            className="w-full max-w-4xl bg-gradient-to-r from-[#B27E57] via-[#C0A086] to-[#5A4135] text-white py-7 rounded-2xl shadow-2xl text-center mb-10 border-4 border-[#E3D7CB]/40"

          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide drop-shadow-lg">🐾 Community Wall🐾</h1>
          </header>

          <main className="w-full max-w-2xl">

            <div className="text-center mb-8">
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="bg-gradient-to-r from-[#B27E57] via-[#C0A086] to-[#E3D7CB] hover:from-[#5A4135] hover:to-[#C0A086] text-white font-bold py-3 px-7 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                style={{
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
                }}
              >
                {showPostForm ? 'View Active Discussions' : 'Start a New Discussion'}
              </button>
            </div>


            {showPostForm && (
              <section className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl mb-8 border border-[#C0A086] transition-all duration-300 ease-in-out">
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#B27E57] mb-6 text-center">Start a New Discussion!</h2>
                <form onSubmit={handleAddPost} className="space-y-4">
                  <div>
                    <label htmlFor="petName" className="block text-sm font-medium text-[#5A4135] mb-1">Topic/Pet Name:</label>
                    <input
                      type="text"
                      id="petName"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g., My New Puppy, Discussing Pet Health"
                      className="w-full p-3 border border-[#C0A086] rounded-lg focus:ring-2 focus:ring-[#B27E57] focus:border-transparent transition duration-200 bg-[#E3D7CB]/60"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#5A4135] mb-1">Your Post/Question:</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share your thoughts, ask a question, or tell us a story about your pet!"
                      rows="4"
                      className="w-full p-3 border border-[#C0A086] rounded-lg focus:ring-2 focus:ring-[#B27E57] focus:border-transparent transition duration-200 resize-y bg-[#E3D7CB]/60"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-[#5A4135] mb-1">Image URL (Optional):</label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste a direct image URL here (e.g., of your pet or related topic)"
                      className="w-full p-3 border border-[#C0A086] rounded-lg focus:ring-2 focus:ring-[#B27E57] focus:border-transparent transition duration-200 bg-[#E3D7CB]/60"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#B27E57] via-[#C0A086] to-[#E3D7CB] hover:from-[#5A4135] hover:to-[#C0A086] text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  >
                    Post to Forum
                  </button>
                </form>
              </section>
            )}


            {!showPostForm && (
              <section
                style={{
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
                }}
                className="bg-white/80 backdrop-blur p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 ease-in-out ">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-6 text-center">Active Discussions</h2>
                <div className="space-y-8">
                  {posts.map((post) => (
                    <div key={post.id}
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                      }}

                      className="bg-gradient-to-br from-gray-100 to-[#c0a08650] border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 ">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.petName}
                          className="w-full h-64 sm:h-80 object-cover rounded-t-xl"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/cccccc/888888?text=Image+Unavailable`; }}
                        />
                      )}

                      <div className="p-4 sm:p-6 ">
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{post.petName}</h3>
                        <p className="text-gray-700 text-base leading-relaxed mb-4">{post.description}</p>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500 border-t  border-[#885A3E] pt-3 sm:pt-4 gap-2 sm:gap-0">
                          <span>Posted by: <span className="font-medium text-gray-600">{post.userName}</span></span>
                          <button
                            onClick={() => handleLikeToggle(post.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${post.isLiked
                                ? 'bg-gradient-to-r from-[#B27E57] to-[#5A4135] text-white shadow'
                                : 'bg-gradient-to-r from-[#E3D7CB] to-[#C0A086] text-[#5A4135] hover:from-[#C0A086] hover:to-[#B27E57]'
                              }`}
                          >
                            {post.isLiked ? '🤎' : '🤍'}
                            <span>{post.likes}</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className=" p-4 sm:p-6    mt-6 border-t border-[#885A3E] pt-4 bg-[#E3D7CB] ">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Comments ({post.comments.length})</h4>
                        <div className="space-y-3 mb-4">
                          {post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <div key={comment.id}
                                style={{
                                  boxShadow:
                                    "rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em",

                                }}

                                className="bg-gray-100 p-3 rounded-lg text-sm border border-gray-200">
                                <span className="font-semibold text-[#B27E57]">{comment.userName}:</span> {comment.text}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-400 text-sm">No comments yet. Be the first to reply!</p>
                          )}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const commentInput = e.target.elements.commentText;
                            handleAddComment(post.id, commentInput.value);
                            commentInput.value = '';
                          }}
                          className="flex gap-2"
                        >
                          <input
                            style={{
                              boxShadow: "rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset",
                            }}
                            type="text"
                            name="commentText"
                            placeholder="Add a comment..."
                            className="flex-grow p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-[#B27E57] focus:border-transparent transition duration-200 bg-white"
                            required
                          />
                          <button
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"
                            }}
                            type="submit"
                            className="bg-gradient-to-r from-[#B27E57] to-[#5A4135] hover:from-[#C0A086] hover:to-[#B27E57] text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 shadow-sm"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    </div>

                  ))}
                </div>
              </section>
            )}
          </main>


          <div className="fixed bottom-4 right-4 z-50">
            <button
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"
              }}
              onClick={() => setShowPostForm(true)}
              className="bg-gradient-to-br from-[#B27E57] via-[#C0A086] to-[#E3D7CB] hover:from-[#5A4135] hover:to-[#C0A086] text-white w-16 h-16 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl transition duration-300 ease-in-out transform hover:scale-110 border-4 border-[#E3D7CB]/40"
              aria-label="Start a new discussion"
            >
              +
            </button>
          </div>


        </div>
      </div>
      <Footer />
    </>
  );
}
export default CommunityWall;
