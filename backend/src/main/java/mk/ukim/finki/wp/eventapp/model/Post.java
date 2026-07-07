package mk.ukim.finki.wp.eventapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer"}) //da ne ni se gleda lazy hibernate fieldot
    private Bar bar;
    @Column(unique = true)
    private String postUrl;
    private String caption;
    // Instagram CDN URLs are long — default varchar(255) is not enough
    @Column(length = 2048)
    private String imageUrl;

    // When the event actually happens (kadevecer events carry real dates)
    private OffsetDateTime eventDate;

    // Performers at this event (unidirectional — Artist has no posts list)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "posts_artists",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "artist_id")
    )
    private List<Artist> artists = new ArrayList<>();

}
