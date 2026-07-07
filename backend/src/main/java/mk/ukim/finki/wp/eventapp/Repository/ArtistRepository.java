package mk.ukim.finki.wp.eventapp.Repository;

import mk.ukim.finki.wp.eventapp.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Artist findBySlug(String slug);
}
