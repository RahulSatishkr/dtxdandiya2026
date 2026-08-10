export default function AboutUs() {
  return (
    <section className="homepage-section bg-[#050507] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <header className="homepage-section-header">
          <p>Our story</p>
          <h2>About DTX Dandiya</h2>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-16">
          <div className="relative w-full">
            <img
              src="/assets/team/team.JPG"
              alt="DTX Dandiya Team"
              className="aspect-[4/3] w-full rounded-sm object-cover"
            />
            <span className="absolute -bottom-3 -right-3 h-20 w-20 border-b border-r border-red-500/60" aria-hidden="true" />
          </div>

          <div className="about-editorial-copy">
            <p className="about-lead">Dallas’s collegiate Raas Garba competition, built around exceptional dance and a shared cultural tradition.</p>
            <p>DTX Dandiya brings together outstanding teams from across the country for a weekend of performance, community, and competition.</p>
            <p>Every twirl and drumbeat honors our heritage while creating space for new friendships, joyful celebration, and a community that lasts beyond the stage.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
