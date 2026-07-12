package mk.ukim.finki.wp.eventapp.Repository;

import mk.ukim.finki.wp.eventapp.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository  extends JpaRepository<Post,Long> {
    boolean existsByPostUrl(String postUrl);

    // JOIN FETCH pulls posts + bars + artists in a single query.
    // Without it every post lazy-loads its bar/artists separately —
    // dozens of round-trips to the remote database per request.
    @Query("select distinct p from Post p left join fetch p.bar left join fetch p.artists")
    List<Post> findAllWithDetails();

    @Query("select distinct p from Post p left join fetch p.bar b left join fetch p.artists " +
           "where lower(b.name) like lower(concat('%', :barName, '%'))")
    List<Post> findAllByBarNameWithDetails(@Param("barName") String barName);

    @Query("select p from Post p left join fetch p.bar left join fetch p.artists where p.id = :id")
    Optional<Post> findByIdWithDetails(@Param("id") Long id);
}
