package mk.ukim.finki.wp.eventapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "artists")
public class Artist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String slug;

    private String name;

    // e.g. "Пејач/ка", "DJ" — comes from kadevecer artist pages
    private String role;

    @Column(length = 2048)
    private String imageUrl;

    @Column(length = 512)
    private String instagram;

    @Column(length = 512)
    private String facebook;

    @Column(length = 512)
    private String youtube;

    @Column(length = 512)
    private String kadevecerUrl;
}
